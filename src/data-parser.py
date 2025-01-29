from asammdf import MDF, set_global_option
import json

set_global_option("raise_on_multiple_occurrences", False)


sample_logfile = r"input file path"

mdf = MDF(sample_logfile)
# print("Available Channels:")
# print(mdf.channels_db)

# specific channel
# channel_name = "VSM_internalState"
# print(mdf.get_channel_metadata(channel_name))


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

        # retrieve all occurrences of the signal (group and index)
        #occurrences = mdf.get(signal_name, group=None, index=None)
        
        #if occurrences:  # if there are multiple occurrences
        #    for group, index in occurrences:
        #        # retrieve signal data for the specific group/index
        #        signal_data = mdf.get(signal_name, group=group, index=index)
        #        # because format looks like this: "FSM_brakePressureFront_group41_index3"
        #        data_dict[f"{signal_name}_group{group}_index{index}"] = {
        #            "timestamps": signal_data.timestamps.tolist(),
        #            "values": signal_data.samples.tolist()
        #        }
        #else:
        #    # If only one occurrence exists, just get it
        #    signal_data = mdf.get(signal_name)
        #    data_dict[signal_name] = {
        #        "timestamps": signal_data.timestamps.tolist(),
        #        "values": signal_data.samples.tolist()
        #    }

    # Write the dictionary to a JSON file
    with open(output_file, 'w') as json_file:
        json.dump(data_dict, json_file, indent=4)

sample_output = r"output file path"

# Define the signals you want to extract
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

convert_mdf_to_json(sample_logfile, sample_output, selected_signals)
# this code is a little fucky 
# convert_mdf_to_json(sample_logfile, sample_output)


