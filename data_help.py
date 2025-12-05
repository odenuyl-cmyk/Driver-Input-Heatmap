from asammdf import MDF, set_global_option
import json
import mdfreader
import pandas as pd

set_global_option("raise_on_multiple_occurrences", False)

sample_logfile = MDF("/Users/drach/Downloads/driver-input-heatmap/logfile2024-10-03_10-34-09.mdf")


#sample_logfile = r"/Users/nidhivadlamudi/Desktop/CMR/driver-input-heatmap/logfile_2024-09-28_11-50-57.mdf"
#sample_csv = r"/Users/nidhivadlamudi/Desktop/CMR/driver-input-heatmap/logfile_2024-09-28_11-50-57.csv"
#sample_json = r"/Users/nidhivadlamudi/Desktop/CMR/driver-input-heatmap/data.json"

#mdf = MDF(sample_logfile)
# print("Available Channels:")
# print(mdf.channels_db)

# specific channel
# channel_name = "VSM_internalState"
# print(mdf.get_channel_metadata(channel_name))

selected_signals = [
    "FSM_brakePressureFront",  # Front brake pressure
    "VSM_brakePressureRear",   # Rear brake pressure
    "AMK_FL_ActualVelocity",   # Front-left wheel actual velocity
    "AMK_FR_ActualVelocity",   # Front-right wheel actual velocity
    "AMK_BL_ActualVelocity",   # Back-left wheel actual velocity
    "AMK_BR_ActualVelocity",   # Back-right wheel actual velocity
    "SBG_Accel_X",             # X-acceleration
    "SBG_Accel_Y",             # Y-acceleration
    "SBG_Body_Vel"
    "FSM_throttlePos",         # throttle position
    "FR_Calibrated_Output",    # load cell
    "RL_Calibrated_Output",    # load cell
    "SBG_Latitude",        # position
    "SBG_Longitude",       # position
    "SBG_Latitude_Acc",        # position
    "SBG_Longitude_Acc",       # position
    "SBG_Sol_Position_Valid"
    "FSM_steeringWheelAngle",  # swangle
    "HVI_Voltage",             # Power: Voltage
    "HVI_Current",             # Power: Current
    "HVI_Power"                # Power: Power
]

# Function to convert MDF file to JSON with selected channels


# Extract a specific channel (replace 'ChannelName' with a valid name from your file)
channel_name = "SBG_Latitude"
if channel_name in selected_signals:
    data = sample_logfile.get(channel_name)

    # Print time and data points
    print(f"Data points for {channel_name}:")
    for time, value in zip(data.timestamps, data.samples):
        print(f"Time: {time:.10f}, Value: {value:.10f}")
else:
    print(f"Channel '{channel_name}' not found.")

channel_name = "SBG_Longitude"
if channel_name in selected_signals:
    data = sample_logfile.get(channel_name)

    # Print time and data points
    print(f"Data points for {channel_name}:")
    for time, value in zip(data.timestamps, data.samples):
        print(f"Time: {time:.10f}, Value: {value:.10f}")
else:
    print(f"Channel '{channel_name}' not found.")

#yop = mdfreader.Mdf(sample_logfile, channel_list=selected_signals, convert_after_read=False)
#yop.export_to_csv(sampling=0.01)

#yop = mdfreader.Mdf(sample_logfile, channel_list=selected_signals, convert_after_read=False)
#yop.export_to_csv(sampling=0.01)

#def csv_to_json(csv_file, json_file):
#    df = pd.read_csv(csv_file)
#    df.to_json(json_file, orient="records", indent=4)
#
#csv_to_json(sample_csv, sample_json)


