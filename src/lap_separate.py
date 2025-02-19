import json

with open('/Users/nidhivadlamudi/Desktop/CMR/driver-input-heatmap/data.json', 'r') as file:
    json_data = json.load(file) 

laps = []

state = 0

for entry in json_data:
    if state == 1 and entry.get("AMK_FR_ActualVelocity") == "0.0":
        print(f"Lap end at: {entry.get('t_1')}")
        state = 0

    if state == 0 and entry.get("AMK_FR_ActualVelocity") != "0.0":
        print(f"Lap start at: {entry.get('t_1')}")
        state = 1
        laps.append([])

    if state == 1:
        laps[len(laps)-1].append(entry)