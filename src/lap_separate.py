import json

with open(r'/Users/nidhivadlamudi/Desktop/CMR/driver-input-heatmap/data.json', 'r') as file:
    json_data = json.load(file) 

laps = []
current_lap = []
lap_stats = []
state = 0
lap_number = 1

for entry in json_data:
    velocity = float(entry.get("AMK_FR_ActualVelocity", "0.0"))

    # detect lap start
    if state == 0 and velocity > 0.0:
        print(f"Lap {lap_number} start at: {entry['t_1']}")
        state = 1
        current_lap = []

    # if in a lap, append data
    if state == 1:
        current_lap.append(entry)
    
    if state == 1 and velocity == 0.0:
        print(f"Lap {lap_number} end at {entry['t_1']}")
        state = 0

        # extract relevant lap statistics
        brake_pressures = [float(e["FSM_brakePressureFront"]) for e in current_lap]
        #throttle_positions = [float(e["FSM_throttlePos"]) for e in current_lap]
        steering_angles = [float(e["FSM_steeringWheelAngle"]) for e in current_lap]


        lap_summary = {
            "Lap Number": lap_number,
            "Start Time": current_lap[0]["t_1"],
            "End Time": current_lap[-1]["t_1"],
            "Duration": float(current_lap[-1]["t_1"]) - float(current_lap[0]["t_1"]),
            "Max Brake Pressure": max(brake_pressures),
            "Min Brake Pressure": min(brake_pressures),
            "Average Brake Pressure": sum(brake_pressures) / len(brake_pressures),
            #"Max Throttle": max(throttle_positions),
            #"Min Throttle": min(throttle_positions),
            #"Average Throttle": sum(throttle_positions) / len(throttle_positions),
            "Max Steering Angle": max(steering_angles),
            "Min Steering Angle": min(steering_angles),
            "Average Steering Angle": sum(steering_angles) / len(steering_angles)
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
