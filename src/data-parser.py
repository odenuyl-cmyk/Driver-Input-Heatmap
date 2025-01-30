from asammdf import MDF, set_global_option
import json
import mdfreader

set_global_option("raise_on_multiple_occurrences", False)


sample_logfile = r"C:\Users\saish\driver-input-heatmap\logfile2024-12-14_13-19-07.mdf"
sample_csv = r"C:\Users\saish\driver-input-heatmap\logfile2024-12-14_13-19-07.csv"

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
    "FSM_throttlePos",         # throttle position
    "FR_Calibrated_Output",    # load cell
    "RL_Calibrated_Output",    # load cell
    "SBG_Latitude_Acc",        # position
    "SBG_Longitude_Acc",       # position
    "FSM_steeringWheelAngle",  # swangle
    "HVI_Voltage",             # Power: Voltage
    "HVI_Current",             # Power: Current
    "HVI_Power"                # Power: Power
]

# Function to convert MDF file to JSON with selected channels

#yop = mdfreader.Mdf(sample_logfile, channel_list=selected_signals, convert_after_read=False)
#yop.export_to_csv(sampling=0.01)

import pandas as pd

def csv_to_json(csv_file, json_file):
    df = pd.read_csv(csv_file)
    df.to_json(json_file, orient="records", indent=4)

csv_to_json(sample_csv, r"C:\Users\saish\driver-input-heatmap\data.json")

def convert_mdf_to_json(input_file, output_file, selected_signals):
    # load the MDF file
    mdf = MDF(input_file)
    
    # dictionary to store selected signal data
    data_dict = {}

    for signal_name in selected_signals:

        signal_data = mdf.get(signal_name)

        signal_data = mdf.get(signal_name)
        data_dict[signal_name] = {
            "timestamps": signal_data.timestamps.tolist(),
            "values": signal_data.samples.tolist()
        }

    # Write the dictionary to a JSON file
    with open(output_file, 'w') as json_file:
        json.dump(data_dict, json_file, indent=4)


sample_output = r"C:\Users\saish\driver-input-heatmap\data.json"


