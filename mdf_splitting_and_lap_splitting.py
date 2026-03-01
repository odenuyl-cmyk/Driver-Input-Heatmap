import argparse
import json
import os
from typing import Optional

import numpy as np
from asammdf import MDF, set_global_option


SELECTED_SIGNALS = [
    "FSM_brakePressureFront",
    "VSM_brakePressureRear",
    "SBG_Accel_X",
    "SBG_Accel_Y",
    "FSM_throttlePos",
    "combined_normalized_throttle",
    "FR_Calibrated_Output",
    "RL_Calibrated_Output",
    "SBG_Latitude",
    "SBG_Longitude",
    "SBG_Latitude_GPS1",
    "SBG_Longitude_GPS1",
    "CDC_Latitude",
    "CDC_Longitude",
    "Movella_Latitude",
    "Movella_Longitude",
    "POSE_latitude_deg",
    "POSE_longitude_deg",
    "SBG_Latitude_Acc",
    "SBG_Longitude_Acc",
    "SBG_Sol_Position_Valid",
    "AMK_FL_ActualVelocity",
    "FSM_steeringWheelAngle",
    "HVI_Voltage",
    "HVI_Current",
    "HVI_Power",
    "VSM_state",
]


def detect_periods_by_throttle(
    mdf: MDF,
    start_threshold: float,
    end_threshold: float,
    end_hold_time: float,
    throttle_signal: str,
    timebase_signal: Optional[str],
):
    throttle = mdf.select([throttle_signal])[0]
    if timebase_signal:
        timebase = mdf.select([timebase_signal])[0]
        timestamps = timebase.timestamps
        throttle_rs = throttle.interp(timestamps)
    else:
        timestamps = throttle.timestamps
        throttle_rs = throttle

    throttle_vals = throttle_rs.samples

    dt = float(np.median(np.diff(timestamps)))
    end_hold_samples = int(end_hold_time / dt)

    periods = []
    in_period = False
    start_idx = None
    below_count = 0

    for i in range(1, len(throttle_vals)):
        if not in_period:
            if throttle_vals[i - 1] < start_threshold and throttle_vals[i] >= start_threshold:
                in_period = True
                start_idx = i
                below_count = 0
            continue

        if throttle_vals[i] < end_threshold:
            below_count += 1
            if below_count >= end_hold_samples:
                end_idx = i - below_count
                periods.append((start_idx, end_idx))
                in_period = False
                start_idx = None
                below_count = 0
        else:
            below_count = 0

    if in_period:
        periods.append((start_idx, len(throttle_vals) - 1))

    return periods, timestamps


def mdf_to_json(segment: MDF, out_path: str):
    available = set(segment.channels_db.keys())
    selected = [s for s in SELECTED_SIGNALS if s in available]
    missing = [s for s in SELECTED_SIGNALS if s not in available]
    if missing:
        print(f"[warn] Missing signals in segment: {missing}")

    if not selected:
        raise ValueError("No selected signals found in this segment.")

    # Use throttle timestamps as the base time axis
    timebase_signal = "FSM_throttlePos" if "FSM_throttlePos" in available else "combined_normalized_throttle"
    timebase = segment.select([timebase_signal])[0]
    timestamps = timebase.timestamps

    records = []
    signals = {}
    for name in selected:
        sig = segment.select([name])[0]
        if len(sig.samples) == 0:
            signals[name] = np.full_like(timestamps, np.nan, dtype=float)
        elif sig.timestamps is timestamps:
            signals[name] = sig.samples.astype(float)
        else:
            signals[name] = sig.interp(timestamps).samples.astype(float)

    for i, t in enumerate(timestamps):
        row = {"time": float(t)}
        for name in selected:
            val = signals[name][i]
            row[name] = None if np.isnan(val) else float(val)
        records.append(row)

    with open(out_path, "w") as f:
        json.dump(records, f, indent=4)


LAT_KEYS = [
    "SBG_Latitude",
    "SBG_Latitude_GPS1",
    "Movella_Latitude",
    "CDC_Latitude",
    "POSE_latitude_deg",
]
LON_KEYS = [
    "SBG_Longitude",
    "SBG_Longitude_GPS1",
    "Movella_Longitude",
    "CDC_Longitude",
    "POSE_longitude_deg",
]


def pick_first_key(records, candidates):
    for key in candidates:
        if any((r.get(key) is not None) for r in records):
            return key
    return None


def split_laps_from_json(
    json_path: str,
    output_dir: str,
    lat_key: str,
    lon_key: str,
    start_dist_m: float,
    end_dist_m: float,
    speed_key: Optional[str] = None,
    track_length_m: Optional[float] = None,
    speed_scale: float = 1.0,
):
    with open(json_path, "r") as f:
        records = json.load(f)

    laps = []
    lap_stats = []
    state = 0
    lap_number = 1

    ct = 0
    init_offset_meters_x = 0.0
    init_offset_meters_y = 0.0
    start_time = 0.0
    end_time = 0.0

    if lat_key and lon_key:
        for entry in records:
            lat = entry.get(lat_key)
            lon = entry.get(lon_key)
            if lat is None or lon is None:
                continue

            x_meters = lon * 111319.5 * np.cos(lat)
            y_meters = lat * 111111

            if ct == 0:
                init_offset_meters_x = x_meters
                init_offset_meters_y = y_meters

            ct += 1
            distx = abs(x_meters - init_offset_meters_x)
            disty = abs(y_meters - init_offset_meters_y)

            if state == 0 and distx > start_dist_m and disty > start_dist_m:
                state = 1
                current_lap = []
                start_time = ct

            if state == 1:
                current_lap.append(entry)

            if state == 1 and distx < end_dist_m and disty < end_dist_m:
                state = 0
                end_time = ct
                lap_summary = {
                    "Lap Number": lap_number,
                    "Start Time": start_time,
                    "End Time": end_time,
                    "Duration": end_time - start_time,
                }
                laps.append(current_lap)
                lap_stats.append(lap_summary)
                lap_number += 1
    elif speed_key and track_length_m is not None:
        # Distance-based laps using speed integration
        distance = 0.0
        current_lap = []
        lap_start_time = records[0]["time"] if records else 0.0

        for i in range(1, len(records)):
            v = records[i].get(speed_key)
            if v is None:
                continue
            dt = records[i]["time"] - records[i - 1]["time"]
            distance += max(0.0, float(v) * speed_scale) * max(0.0, dt)
            current_lap.append(records[i])

            if distance >= track_length_m:
                lap_summary = {
                    "Lap Number": lap_number,
                    "Start Time": lap_start_time,
                    "End Time": records[i]["time"],
                    "Duration": records[i]["time"] - lap_start_time,
                }
                laps.append(current_lap)
                lap_stats.append(lap_summary)
                lap_number += 1
                distance = 0.0
                lap_start_time = records[i]["time"]
                current_lap = []
    else:
        # Fallback: one lap = whole segment
        if records:
            laps.append(records)
            lap_stats.append(
                {
                    "Lap Number": lap_number,
                    "Start Time": records[0]["time"],
                    "End Time": records[-1]["time"],
                    "Duration": records[-1]["time"] - records[0]["time"],
                }
            )

    os.makedirs(output_dir, exist_ok=True)
    for i, (lap_data, lap_summary) in enumerate(zip(laps, lap_stats), start=1):
        with open(os.path.join(output_dir, f"lap_{i}.json"), "w") as f:
            json.dump(lap_data, f, indent=4)
        with open(os.path.join(output_dir, f"lap_{i}_stats.json"), "w") as f:
            json.dump(lap_summary, f, indent=4)

    return len(laps)


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    parser = argparse.ArgumentParser(
        description="Detect throttle periods, split MDF, export JSON, and split laps."
    )
    parser.add_argument("mdf_path", help="Path to input MDF file")
    parser.add_argument(
        "--output-dir",
        default=os.path.join(base_dir, "segments_with_laps"),
        help="Root output directory",
    )
    parser.add_argument(
        "--throttle-signal",
        default=None,
        help="Throttle signal name (default: FSM_throttlePos or combined_normalized_throttle)",
    )
    parser.add_argument(
        "--timebase-signal",
        default=None,
        help="Signal to use for timestamps (default: throttle timestamps)",
    )
    parser.add_argument(
        "--lat-signal",
        default=None,
        help="Latitude signal in JSON (default: SBG_Latitude or Movella_Latitude or POSE_latitude_deg)",
    )
    parser.add_argument(
        "--lon-signal",
        default=None,
        help="Longitude signal in JSON (default: SBG_Longitude or Movella_Longitude or POSE_longitude_deg)",
    )
    parser.add_argument("--lap-start-dist", type=float, default=0.5)
    parser.add_argument("--lap-end-dist", type=float, default=1.0)
    parser.add_argument("--track-length-m", type=float, default=None)
    parser.add_argument("--speed-signal", default="AMK_FL_ActualVelocity")
    parser.add_argument("--speed-scale", type=float, default=1.0)
    parser.add_argument("--start-threshold", type=float, default=100.0)
    parser.add_argument("--end-threshold", type=float, default=10.0)
    parser.add_argument("--end-hold-time", type=float, default=10.0)
    args = parser.parse_args()

    set_global_option("raise_on_multiple_occurrences", False)
    mdf = MDF(args.mdf_path)

    available = set(mdf.channels_db.keys())
    throttle_signal = args.throttle_signal
    if throttle_signal is None:
        if "FSM_throttlePos" in available:
            throttle_signal = "FSM_throttlePos"
        elif "combined_normalized_throttle" in available:
            throttle_signal = "combined_normalized_throttle"
        else:
            raise ValueError("No throttle signal found (expected FSM_throttlePos or combined_normalized_throttle).")

    # Auto-adjust thresholds if using normalized throttle and defaults were not overridden
    start_threshold = args.start_threshold
    end_threshold = args.end_threshold
    if throttle_signal == "combined_normalized_throttle" and args.start_threshold == 100.0 and args.end_threshold == 10.0:
        start_threshold = 0.7
        end_threshold = 0.1

    periods, timestamps = detect_periods_by_throttle(
        mdf,
        start_threshold,
        end_threshold,
        args.end_hold_time,
        throttle_signal,
        args.timebase_signal,
    )

    print(f"Detected {len(periods)} racing segments")
    os.makedirs(args.output_dir, exist_ok=True)

    for i, (start_idx, end_idx) in enumerate(periods, start=1):
        t0 = timestamps[start_idx]
        t1 = timestamps[end_idx]
        duration = t1 - t0

        segment = mdf.cut(start=t0, stop=t1)
        segment_dir = os.path.join(args.output_dir, f"segment_{i:02d}")
        os.makedirs(segment_dir, exist_ok=True)

        segment_mdf_path = os.path.join(segment_dir, "segment.mdf")
        segment.save(segment_mdf_path, overwrite=True)

        segment_json_path = os.path.join(segment_dir, "segment.json")
        mdf_to_json(segment, segment_json_path)

        laps_dir = os.path.join(segment_dir, "laps")
        # Prefer keys that actually exist in the JSON
        with open(segment_json_path, "r") as f:
            records = json.load(f)

        lat_key = args.lat_signal or pick_first_key(records, LAT_KEYS)
        lon_key = args.lon_signal or pick_first_key(records, LON_KEYS)

        if lat_key is None or lon_key is None:
            print("[warn] No latitude/longitude keys found in segment JSON; using fallback lap logic.")
        else:
            # Basic diagnostics to explain why laps might be missing
            lat_vals = [r.get(lat_key) for r in records if r.get(lat_key) is not None]
            lon_vals = [r.get(lon_key) for r in records if r.get(lon_key) is not None]
            if not lat_vals or not lon_vals:
                print(f"[warn] {lat_key}/{lon_key} present but empty; using fallback lap logic.")
                lat_key = None
                lon_key = None
            else:
                lat_span = max(lat_vals) - min(lat_vals)
                lon_span = max(lon_vals) - min(lon_vals)
                if lat_span == 0 or lon_span == 0:
                    print(f"[warn] {lat_key}/{lon_key} have zero span; laps unlikely.")

        speed_key = args.speed_signal if any((r.get(args.speed_signal) is not None) for r in records) else None
        if args.track_length_m is not None and speed_key is None:
            print(f"[warn] Speed signal {args.speed_signal} not found in JSON; cannot use track-length laps.")

        lap_count = split_laps_from_json(
            segment_json_path,
            laps_dir,
            lat_key,
            lon_key,
            args.lap_start_dist,
            args.lap_end_dist,
            speed_key=speed_key,
            track_length_m=args.track_length_m if speed_key else None,
            speed_scale=args.speed_scale,
        )

        print(
            f"Segment {i:02d}: {t0:.3f}s -> {t1:.3f}s ({duration:.1f}s), "
            f"laps: {lap_count} -> {segment_dir}"
        )


if __name__ == "__main__":
    main()
