from asammdf import MDF, set_global_option
import json
import mdfreader
import pandas as pd

set_global_option("raise_on_multiple_occurrences", False)


sample_logfile = r"C:/Users/odenu/OneDrive\Documents/GitHub/driver-input-heatmap/src/logfile2024-10-03_13-44-50.mdf"
sample_csv = r"C:/Users/odenu/OneDrive\Documents/GitHub/driver-input-heatmap/src/logfile2024-10-03_13-44-50.csv"
sample_json = r"C:/Users/odenu/OneDrive\Documents/GitHub/driver-input-heatmap/src/logfile2024-10-03_13-44-50.json"

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
    "FSM_steeringWheelAngle",  # swangle
    "HVI_Voltage",             # Power: Voltage
    "HVI_Current",             # Power: Current
    "HVI_Power",                # Power: Power
    "SBG_Yaw"
]

# Function to convert MDF file to JSON with selected channels

yop = mdfreader.Mdf(sample_logfile, channel_list=selected_signals, convert_after_read=False)
yop.export_to_csv(sampling=0.01)

def csv_to_json(csv_file, json_file):
    df = pd.read_csv(csv_file)
    df.to_json(json_file, orient="records", indent=4)

csv_to_json(sample_csv, sample_json)


