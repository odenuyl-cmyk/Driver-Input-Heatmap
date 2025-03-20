import json
import math

with open(r'/Users/nidhivadlamudi/Desktop/CMR/driver-input-heatmap/data.json', 'r') as file:
    json_data = json.load(file) 


laps = []
current_lap = []
lap_stats = []
sector_stats = []
state = 0
lap_number = 1

sector_data = []
sector_xpos = []
sector_ypos = []

ct = 0
start_lat = 0
start_long = 0
init_offset_meters_x = 0
init_offset_meters_y = 0

start_time = 0
end_time = 0
sector_time = 0
sector_start = 0
sector_end = 0
sector_num = 0

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
            if(lap_number == 1):
                sector_xpos.append(x_meters)
                sector_ypos.append(y_meters)
                sector_start = ct
        
        ct += 1
        sector_time += 1

        # initially splitting sectors evenly by time
        if(sector_time == 600 and lap_number == 1):
            sector_xpos.append(x_meters)
            sector_ypos.append(y_meters)
            sector_end = ct
            sector_num += 1

            # storing x and y pos of beginning and end of each sector
            sector_summary = {
                "Sector": sector_num,
                "Start Time": sector_start,
                "End Time": sector_end,
                "Duration": sector_time,
                "Start Position": (sector_xpos[len(sector_xpos) - 2], sector_ypos[len(sector_ypos) - 2]),
                "End Position": (x_meters, y_meters)
            }
            sector_data.append(sector_summary)
            sector_time = 0

        # checking if new sector entered
        if(lap_number > 1):
            x_dist = abs(x_meters - sector_data[sector_num]["Start Position"][0])
            y_dist = abs(x_meters - sector_data[sector_num]["Start Position"][1])
            if(x_dist > 0.5 and y_dist > 0.5):
                sector_end = ct

                sector_start = ct
                sector_num += 1
                sector_summary = {
                    "Sector": sector_num,
                    "Start Time": sector_start,
                    "End Time": sector_end,
                    "Duration": sector_end - sector_start,
                    "Start Position": (sector_xpos[sector_num-1], sector_ypos[sector_num-1]),
                    "End Position": (x_meters, y_meters)
                }
                sector_data.append(sector_summary) 

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

            sector_xpos.append(x_meters)
            sector_ypos.append(y_meters)
            sector_time = 0
            sector_end = ct
            sector_num += 1

            # storing x and y pos of beginning and end of each sector
            sector_summary = {
                "Sector": sector_num,
                "Start Time": sector_start,
                "End Time": sector_end,
                "Duration": sector_time,
                "Start Position": (sector_xpos[len(sector_xpos) - 2], sector_ypos[len(sector_ypos) - 2]),
                "End Position": (x_meters, y_meters)
            }
            sector_data.append(sector_summary)

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
        
            sector_start = ct
            sector_num = 1

            laps.append(current_lap) # store lap data
            lap_stats.append(lap_summary)
            sector_stats.append(sector_data)
            sector_data = []
            lap_number += 1 # increment
    
    # save each lap's data and stats
for i, (lap_data, lap_summary, sector_data) in enumerate(zip(laps, lap_stats, sector_stats)):
    with open(f'lap_{i+1}.json', 'w') as outfile:
        json.dump(lap_data, outfile, indent=4)
    with open(f'lap_{i+1}_stats.json', 'w') as stats_file:
        json.dump(lap_summary, stats_file, indent=4)
    with open(f'lap_{i+1}_sectors.json', 'w') as stats_file:
        json.dump(sector_data, stats_file, indent=4)


print(f"Saved {len(laps)} laps and their summaries.")
