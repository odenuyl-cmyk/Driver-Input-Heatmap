import json
import math

with open(r'/Users/nidhivadlamudi/Desktop/CMR/driver-input-heatmap/data.json', 'r') as file:
    json_data = json.load(file) 



laps = []
current_lap = []
lap_stats = []
state = 0
lap_number = 1

init_offset_meters_x = 0
init_offset_meters_y = 0
first_data_processed = False

ct = 0
start_lat = 0
start_long = 0
init_offset_meters_x = 0
init_offset_meters_y = 0

start_time = 0
end_time = 0

for entry in json_data:
    
    lat = entry.get("Latitude")
    long = entry.get("Longitude")
    #print("lat ", lat, " long ", long)
    
    if(lat is not None and long is not None):
        x_meters = long * 111319.5 * math.cos(lat)
        y_meters = lat * 111111

        if(ct == 0):
            start_lat = lat
            start_long = long
            init_offset_meters_x = x_meters
            init_offset_meters_y = y_meters
        
        ct += 1

        distx = abs(x_meters - init_offset_meters_x)
        disty = abs(y_meters - init_offset_meters_y)

        # detect lap start by position
        if (state == 0 and distx > 0.5 and disty > 0.5):
            print(f"Lap {lap_number} start at: {ct}")
            state = 1
            current_lap = []
            start_time = ct

        '''
        # detect lap start by velocity
        if state == 0 and velocity > 0.0:
            print(f"Lap {lap_number} start at: {entry['time']}")
            state = 1
            current_lap = []
        '''

        # if in a lap, append data
        if state == 1:
            current_lap.append(entry)
        
        if (state == 1 and distx < 1 and disty < 1):
            print(f"Lap {lap_number} end at {ct}")
            state = 0
            end_time = ct

            # extract relevant lap statistics
            # brake_pressures = [float(e["FSM_brakePressureFront"]) for e in current_lap]
            #throttle_positions = [float(e["FSM_throttlePos"]) for e in current_lap]
            # steering_angles = [float(e["FSM_steeringWheelAngleADC"]) for e in current_lap]


            lap_summary = {
                "Lap Number": lap_number,
                "Start Time": start_time, #current_lap[0]["time"],
                "End Time": end_time, #current_lap[-1]["time"],
                "Duration": end_time - start_time#float(current_lap[-1]["time"]) - float(current_lap[0]["time"]),
                # "Max Brake Pressure": max(brake_pressures),
                # "Min Brake Pressure": min(brake_pressures),
                # "Average Brake Pressure": sum(brake_pressures) / len(brake_pressures),
                #"Max Throttle": max(throttle_positions),
                #"Min Throttle": min(throttle_positions),
                #"Average Throttle": sum(throttle_positions) / len(throttle_positions),
                # "Max Steering Angle": max(steering_angles),
                # "Min Steering Angle": min(steering_angles),
                # "Average Steering Angle": sum(steering_angles) / len(steering_angles)
            }
        

            laps.append(current_lap) # store lap data
            lap_stats.append(lap_summary)
            lap_number += 1 # increment per
    
    # save each lap's data and stats
for i, (lap_data, lap_summary) in enumerate(zip(laps, lap_stats)):
    with open(f'lap_{i+1}.json', 'w') as outfile:
        json.dump(lap_data, outfile, indent=4)
    with open(f'lap_{i+1}_stats.json', 'w') as stats_file:
        json.dump(lap_summary, stats_file, indent=4)


print(f"Saved {len(laps)} laps and their summaries.")
