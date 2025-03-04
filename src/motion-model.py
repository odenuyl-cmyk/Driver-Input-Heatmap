import json
import numpy as np
import matplotlib.pyplot as plt
import math

def parse_and_predict_motion():
    init_offset_meters_x = 0
    init_offset_meters_y = 0
    first_data_processed = False
    
    with open('lap_6.json') as f:
        json_data = json.load(f)
        x_array = np.array([])
        y_array = np.array([])
        
        for entry in json_data:
            lat = entry.get("SBG_Latitude")
            lon = entry.get("SBG_Longitude")
            x_meters = lon * 111319.5 * math.cos(lat)
            y_meters = lat * 111111
            
            if not first_data_processed:
                init_offset_meters_x = x_meters
                init_offset_meters_y = y_meters
                first_data_processed = True
            
            x_array = np.append(x_array, x_meters - init_offset_meters_x)
            y_array = np.append(y_array, y_meters - init_offset_meters_y)
        
        # plot original trajectory of raceline points
        plt.figure(figsize=(8, 6))
        plt.scatter(x_array, y_array, label='original data', alpha=0.5)
        
        # compute and plot motion model prediction
        positions = predict_positions(x_array[0], y_array[0], np.mean(np.diff(x_array)), np.mean(np.diff(y_array)), len(x_array), 1)
        plot_trajectory(positions, overlay=True)
        
        plt.legend()
        plt.show()

def predict_positions(x0, y0, vx, vy, time_steps, dt):
    # predicts the position of a vehicle given initial pos, velocity, and timesteps
    positions = [(x0, y0)]
    
    for t in range(1, time_steps + 1):
        x = x0 + vx * t * dt
        y = y0 + vy * t * dt
        positions.append((x, y))
    
    return positions

def plot_trajectory(positions, overlay=False):
    x_vals, y_vals = zip(*positions)
    plt.plot(x_vals, y_vals, marker='o', linestyle='-', label='motion model' if not overlay else 'predicted data')
    plt.xlabel('x pos')
    plt.ylabel('y pos')
    plt.title('raceline plot')
    plt.grid(True)

# Run analysis
parse_and_predict_motion()
