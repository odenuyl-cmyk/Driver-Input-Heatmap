import json
import numpy as np
import matplotlib.pyplot as plt
import math

# using vx, vy and ax, ay for trying to figure out precise motion
def compute_velocity(x_array, y_array, dt=1):
    # compute velocity per step 
    vx = np.gradient(x_array, dt)
    vy = np.gradient(y_array, dt)
    return vx, vy

def compute_accel(vx, vy, dt=1):
    # compute accel from the vel changes
    ax = np.gradient(vx, dt)
    ay = np.gradient(vy, dt)
    return ax, ay

def predict_positions(x_array, y_array, vx, vy, ax, ay, time_steps, dt):
    positions = [(x_array[0], y_array[0])]
    x, y = x_array[0], y_array[0]
    
    vx_curr = vx[0]  # Take first velocity element
    vy_curr = vy[0] 

    for t in range(1, time_steps):
        vx_curr += ax[t] * dt  # Use scalar updates
        vy_curr += ay[t] * dt
        x += vx_curr * dt  
        y += vy_curr * dt
        positions.append((x, y)) 
    
    return positions



# tried moving average to filter out behavior but like,, didn't really work
# def moving_average(arr, window_size=5):
#     # hopefully this filters some numbers out?
#     return np.convolve(arr, np.ones(window_size)/window_size, mode='valid')

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

        # compute velocity and acceleration per step
        vx, vy = compute_velocity(x_array, y_array)
        ax, ay = compute_accel(vx, vy)
        
        # ensure correct number of steps
        num_steps = len(x_array)
        
        # plot original trajectory of raceline points
        plt.figure(figsize=(8, 6))
        plt.scatter(x_array, y_array, label='original data', alpha=0.5, c='blue')
        
        # compute and plot motion model prediction
        positions = predict_positions(x_array, y_array, vx, vy, ax, ay, num_steps, 1)
        plot_trajectory(positions, overlay=True)
        
        plt.legend()
        plt.show()

# def predict_positions(x0, y0, vx, vy, time_steps, dt):
#     # predicts the position of a vehicle given initial pos, velocity, and timesteps
#     positions = [(x0, y0)]
    
#     for t in range(1, time_steps + 1):
#         x = x0 + vx * t * dt
#         y = y0 + vy * t * dt
#         positions.append((x, y))
    
#     return positions

def plot_trajectory(positions, overlay=False):
    x_vals, y_vals = zip(*positions)
    plt.plot(x_vals, y_vals, marker='o', linestyle='-', color='red', label='motion model')
    plt.xlabel('x pos')
    plt.ylabel('y pos')
    plt.title('raceline plot')
    plt.grid(True)

# Run analysis
parse_and_predict_motion()
