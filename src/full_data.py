import argparse
import json
import math
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import numpy as np

SELECTED_SIGNALS = [
    "Movella_AccX",
    "Movella_AccY",
    "Movella_AccZ",
    "SBG_Accel_X",
    "SBG_Accel_Y",
    "SBG_Accel_Z",
    "FSM_throttlePos",
    "combined_normalized_throttle",
    "FSM_brakePressureFront",
    "VSM_brakePressureRear",
    "Movella_Latitude",
    "Movella_Longitude",
    "SBG_Latitude",
    "SBG_Longitude",
    "SBG_Latitude_GPS1",
    "SBG_Longitude_GPS1",
    "CDC_Latitude",
    "CDC_Longitude",
    "POSE_latitude_deg",
    "POSE_longitude_deg"
]

LATITUDE_CANDIDATES = [
    "Movella_Latitude",
    "Latitude",
    "SBG_Latitude",
    "SBG_Latitude_GPS1",
    "CDC_Latitude",
    "POSE_latitude_deg",
]
LONGITUDE_CANDIDATES = [
    "Movella_Longitude",
    "Longitude",
    "SBG_Longitude",
    "SBG_Longitude_GPS1",
    "CDC_Longitude",
    "POSE_longitude_deg",
]
THROTTLE_CANDIDATES = ["FSM_throttlePos", "combined_normalized_throttle", "Throttle", "throttle"]

CANONICAL_ALIASES = {
    "Movella_Latitude": LATITUDE_CANDIDATES,
    "Movella_Longitude": LONGITUDE_CANDIDATES,
    "FSM_throttlePos": ["FSM_throttlePos", "combined_normalized_throttle", "Throttle", "throttle"],
    "FSM_brakePressureFront": ["FSM_brakePressureFront", "VSM_brakePressureRear"],
    "Movella_AccX": ["Movella_AccX", "SBG_Accel_X"],
    "Movella_AccY": ["Movella_AccY", "SBG_Accel_Y"],
    "Movella_AccZ": ["Movella_AccZ", "SBG_Accel_Z"],
}


def _clean_value(value: Any) -> Any:
    if isinstance(value, np.generic):
        value = value.item()
    if isinstance(value, float) and math.isnan(value):
        return None
    return value


def _pick_first_from_keys(keys: Iterable[str], candidates: Iterable[str]) -> Optional[str]:
    key_set = set(keys)
    for candidate in candidates:
        if candidate in key_set:
            return candidate
    return None


def _pick_first_from_records(records: List[Dict[str, Any]], candidates: Iterable[str]) -> Optional[str]:
    for candidate in candidates:
        for row in records:
            val = row.get(candidate)
            if val is not None:
                return candidate
    return None


def extract_mdf_records(input_path: Path, sampling: float) -> List[Dict[str, Any]]:
    try:
        from asammdf import MDF, set_global_option
    except ModuleNotFoundError as exc:
        raise ModuleNotFoundError(
            "Missing Python dependency 'asammdf'. Install with: python3 -m pip install asammdf"
        ) from exc

    set_global_option("raise_on_multiple_occurrences", False)
    mdf = MDF(str(input_path))
    available_channels = set(mdf.channels_db.keys())
    present_signals = [signal for signal in SELECTED_SIGNALS if signal in available_channels]
    if not present_signals:
        raise RuntimeError(
            "None of the selected signals were found in the MDF file. "
            f"Expected one of: {', '.join(SELECTED_SIGNALS)}"
        )

    df = mdf.to_dataframe(channels=present_signals, raster=sampling, time_from_zero=True)
    if df.empty:
        raise RuntimeError("MDF extraction returned zero rows.")

    if hasattr(df.columns, "levels"):
        # Flatten multi-index columns if needed.
        df.columns = [col[0] if isinstance(col, tuple) else col for col in df.columns]

    # Normalize heterogeneous signal names into keys expected by frontend + lap logic.
    col_set = set(str(c) for c in df.columns)
    for target, aliases in CANONICAL_ALIASES.items():
        if target in col_set:
            continue
        source = _pick_first_from_keys(col_set, aliases)
        if source and source in df.columns:
            df[target] = df[source]
            col_set.add(target)

    records: List[Dict[str, Any]] = []
    for timestamp, row in df.iterrows():
        row_data = {str(k): _clean_value(v) for k, v in row.to_dict().items()}
        row_data["time"] = _clean_value(float(timestamp))
        records.append(row_data)

    return records


def _valid_indices_and_xy(
    records: List[Dict[str, Any]], lat_key: str, lon_key: str
) -> Tuple[List[int], np.ndarray]:
    valid_indices: List[int] = []
    xy: List[Tuple[float, float]] = []
    for idx, entry in enumerate(records):
        lat = entry.get(lat_key)
        lon = entry.get(lon_key)
        if lat is None or lon is None:
            continue
        try:
            lat_f = float(lat)
            lon_f = float(lon)
        except (TypeError, ValueError):
            continue

        x_meters = lon_f * 111319.5 * math.cos(math.radians(lat_f))
        y_meters = lat_f * 111111.0
        valid_indices.append(idx)
        xy.append((x_meters, y_meters))

    if not xy:
        return [], np.zeros((0, 2), dtype=float)
    return valid_indices, np.array(xy, dtype=float)


def _smooth_xy(xy: np.ndarray, window: int = 7) -> np.ndarray:
    if len(xy) < window or window <= 1:
        return xy
    kernel = np.ones(window, dtype=float) / float(window)
    pad = window // 2
    x_p = np.pad(xy[:, 0], (pad, pad), mode="edge")
    y_p = np.pad(xy[:, 1], (pad, pad), mode="edge")
    x_s = np.convolve(x_p, kernel, mode="valid")
    y_s = np.convolve(y_p, kernel, mode="valid")
    return np.column_stack((x_s, y_s))


def _detect_active_segments(
    records: List[Dict[str, Any]],
    throttle_key: Optional[str],
    min_segment_seconds: float = 20.0,
    merge_gap_seconds: float = 5.0,
    end_hold_seconds: float = 2.0,
) -> List[Tuple[int, int]]:
    if not records:
        return []

    if throttle_key is None:
        return [(0, len(records) - 1)]

    times = np.array([float(r.get("time", i)) for i, r in enumerate(records)], dtype=float)
    dt = float(np.median(np.diff(times))) if len(times) > 1 else 0.01
    dt = dt if dt > 0 else 0.01
    hold_samples = max(1, int(end_hold_seconds / dt))

    raw = np.array([r.get(throttle_key) for r in records], dtype=object)
    vals = np.array(
        [float(v) if v is not None and str(v) != "nan" else np.nan for v in raw], dtype=float
    )
    if np.all(np.isnan(vals)):
        return [(0, len(records) - 1)]

    # Fill NaNs with zero to prevent spurious fragmentation.
    vals = np.nan_to_num(vals, nan=0.0)
    vmax = float(np.nanmax(vals))
    if vmax <= 0:
        return [(0, len(records) - 1)]

    if vmax <= 1.5:
        # Normalized throttle [0,1].
        start_threshold = max(0.12, 0.2 * vmax)
        end_threshold = max(0.05, 0.1 * vmax)
    else:
        # Percentage-like throttle [0,100].
        start_threshold = max(8.0, 0.2 * vmax)
        end_threshold = max(3.0, 0.1 * vmax)

    segments: List[Tuple[int, int]] = []
    in_period = False
    start_idx = 0
    below_count = 0
    for i, v in enumerate(vals):
        if not in_period:
            if v >= start_threshold:
                in_period = True
                start_idx = i
                below_count = 0
            continue

        if v < end_threshold:
            below_count += 1
            if below_count >= hold_samples:
                end_idx = i - below_count
                if end_idx > start_idx:
                    segments.append((start_idx, end_idx))
                in_period = False
                below_count = 0
        else:
            below_count = 0

    if in_period:
        segments.append((start_idx, len(records) - 1))

    # Merge close segments and enforce minimum segment duration.
    merged: List[Tuple[int, int]] = []
    for s, e in segments:
        if not merged:
            merged.append((s, e))
            continue
        prev_s, prev_e = merged[-1]
        gap = times[s] - times[prev_e]
        if gap <= merge_gap_seconds:
            merged[-1] = (prev_s, max(prev_e, e))
        else:
            merged.append((s, e))

    result: List[Tuple[int, int]] = []
    for s, e in merged:
        if times[e] - times[s] >= min_segment_seconds:
            result.append((s, e))
    return result or [(0, len(records) - 1)]


def _find_lap_boundaries_in_segment(
    records: List[Dict[str, Any]],
    lat_key: str,
    lon_key: str,
    seg_start: int,
    seg_end: int,
    min_lap_seconds: float,
) -> List[int]:
    segment_records = records[seg_start : seg_end + 1]
    valid_indices, xy_raw = _valid_indices_and_xy(segment_records, lat_key, lon_key)
    if len(valid_indices) < 20:
        return [seg_start, seg_end]

    xy = _smooth_xy(xy_raw)
    sample_count = min(20, len(xy))
    origin = np.mean(xy[:sample_count], axis=0)
    dists = np.linalg.norm(xy - origin, axis=1)
    max_dist = float(np.max(dists))
    if max_dist < 3.0:
        return [seg_start, seg_end]

    depart_threshold = max(8.0, min(40.0, 0.08 * max_dist))
    return_threshold = max(2.0, min(depart_threshold * 0.5, 0.03 * max_dist))

    # Convert segment-local valid indices back to global sample indices.
    valid_global = [seg_start + i for i in valid_indices]
    valid_times = [float(records[i].get("time", i)) for i in valid_global]

    boundaries = [seg_start]
    armed = False
    last_boundary_t = float(records[seg_start].get("time", seg_start))

    for local_i, global_i in enumerate(valid_global):
        dist = dists[local_i]
        t = valid_times[local_i]

        if not armed and dist >= depart_threshold:
            armed = True
            continue

        if armed and dist <= return_threshold and (t - last_boundary_t) >= min_lap_seconds:
            boundaries.append(global_i)
            last_boundary_t = t
            armed = False

    boundaries.append(seg_end)
    deduped: List[int] = []
    for idx in boundaries:
        if not deduped or idx > deduped[-1]:
            deduped.append(idx)
    return deduped


def split_laps(records: List[Dict[str, Any]], min_lap_seconds: float = 20.0) -> Tuple[List[List[Dict[str, Any]]], List[Dict[str, Any]]]:
    if not records:
        return [], []

    lat_key = _pick_first_from_records(records, LATITUDE_CANDIDATES)
    lon_key = _pick_first_from_records(records, LONGITUDE_CANDIDATES)
    throttle_key = _pick_first_from_records(records, THROTTLE_CANDIDATES)

    if lat_key is None or lon_key is None:
        return [records], [{
            "Lap Number": 1,
            "Start Index": 0,
            "End Index": len(records) - 1,
            "Start Time": records[0].get("time"),
            "End Time": records[-1].get("time"),
            "Duration": (records[-1].get("time") or (len(records)-1)) - (records[0].get("time") or 0),
            "Samples": len(records),
            "Reason": "No latitude/longitude keys available; fallback single lap",
        }]

    laps: List[List[Dict[str, Any]]] = []
    lap_stats: List[Dict[str, Any]] = []
    lap_number = 1
    segments = _detect_active_segments(records, throttle_key=throttle_key)
    for seg_start, seg_end in segments:
        boundaries = _find_lap_boundaries_in_segment(
            records=records,
            lat_key=lat_key,
            lon_key=lon_key,
            seg_start=seg_start,
            seg_end=seg_end,
            min_lap_seconds=min_lap_seconds,
        )

        for i in range(len(boundaries) - 1):
            start_idx = boundaries[i]
            end_idx = boundaries[i + 1]
            if end_idx <= start_idx:
                continue

            start_t = float(records[start_idx].get("time", start_idx))
            end_t = float(records[end_idx].get("time", end_idx))
            duration = end_t - start_t
            if duration < max(6.0, min_lap_seconds * 0.5):
                continue

            lap_data = records[start_idx : end_idx + 1]
            lap_summary = {
                "Lap Number": lap_number,
                "Start Index": start_idx,
                "End Index": end_idx,
                "Start Time": start_t,
                "End Time": end_t,
                "Duration": duration,
                "Samples": len(lap_data),
                "Segment Start": seg_start,
                "Segment End": seg_end,
            }
            laps.append(lap_data)
            lap_stats.append(lap_summary)
            lap_number += 1

    if not laps:
        # Last-resort fallback for visibility in UI.
        laps = [records]
        lap_stats = [{
            "Lap Number": 1,
            "Start Index": 0,
            "End Index": len(records) - 1,
            "Start Time": records[0].get("time"),
            "End Time": records[-1].get("time"),
            "Duration": (records[-1].get("time") or (len(records)-1)) - (records[0].get("time") or 0),
            "Samples": len(records),
            "Reason": "No robust lap boundaries found; fallback single lap",
        }]

    return laps, lap_stats


def write_outputs(
    output_dir: Path,
    input_path: Path,
    records: List[Dict[str, Any]],
    laps: List[List[Dict[str, Any]]],
    lap_stats: List[Dict[str, Any]],
) -> Dict[str, Any]:
    output_dir.mkdir(parents=True, exist_ok=True)
    laps_dir = output_dir / "laps"
    laps_dir.mkdir(parents=True, exist_ok=True)

    full_data_path = output_dir / "full_data.json"
    full_data_path.write_text(json.dumps(records, indent=2), encoding="utf-8")

    lap_files: List[str] = []
    lap_stats_files: List[str] = []

    for idx, (lap_data, summary) in enumerate(zip(laps, lap_stats), start=1):
        lap_file = laps_dir / f"lap_{idx}.json"
        stats_file = laps_dir / f"lap_{idx}_stats.json"

        lap_file.write_text(json.dumps(lap_data, indent=2), encoding="utf-8")
        stats_file.write_text(json.dumps(summary, indent=2), encoding="utf-8")

        lap_files.append(str(lap_file.relative_to(output_dir)))
        lap_stats_files.append(str(stats_file.relative_to(output_dir)))

    manifest = {
        "source_file": input_path.name,
        "full_data_file": str(full_data_path.relative_to(output_dir)),
        "lap_files": lap_files,
        "lap_stats_files": lap_stats_files,
        "lap_count": len(lap_files),
    }

    manifest_path = output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert MDF telemetry and split into laps.")
    parser.add_argument("--input", required=True, help="Path to the input MDF file")
    parser.add_argument("--output", required=True, help="Directory to write output files")
    parser.add_argument("--sampling", type=float, default=0.01, help="Resampling interval in seconds")
    parser.add_argument("--min-lap-seconds", type=float, default=20.0, help="Minimum time between lap boundaries")
    args = parser.parse_args()

    input_path = Path(args.input).expanduser().resolve()
    output_dir = Path(args.output).expanduser().resolve()

    if not input_path.exists():
        raise FileNotFoundError(f"Input MDF file not found: {input_path}")

    records = extract_mdf_records(input_path=input_path, sampling=args.sampling)
    laps, lap_stats = split_laps(records=records, min_lap_seconds=args.min_lap_seconds)
    manifest = write_outputs(output_dir=output_dir, input_path=input_path, records=records, laps=laps, lap_stats=lap_stats)

    print(json.dumps(manifest))


if __name__ == "__main__":
    main()
