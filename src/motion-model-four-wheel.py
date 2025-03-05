import json
import numpy as np
import matplotlib.pyplot as plt
import math


with open("lap_6.json") as f:
    
    json_data = json.load(f)

# Vehicle parameters
L_f = 0.75  # Distance from CG to front axle (m)
L_r = 0.75  # Distance from CG to rear axle (m)
L = L_f + L_r  # Wheelbase (m)
W = 1.2  # Track width (m)

"""
Simulates car motion given wheel speeds, IMU accelerations, and steering angles.

Parameters:
- wheel_speeds: (N, 4) array of wheel speeds [v_FR, v_FL, v_RR, v_RL] (m/s)
- imu_data: (N, 2) array of accelerations [a_x, a_y] (m/s^2)
- steering_angles: (N,) array of steering angles (rad)
- dt: Time step (s)

Returns:
- x, y, theta: Position and yaw angle over time
"""
x, y, theta = np.array([]), np.array([]), np.array([])
v_x, v_y, omega = 0, 0, 0
ct = 0
dt = 0.01
#prev_t = 0

for entry in json_data:

    #if(ct > 0):
    #    dt = entry.get("t_1") - prev_t
    #    prev_t = entry.get("t_1")
    # wheel speeds
    v_FR = entry.get("AMK_FR_ActualVelocity") * 2 * math.pi * 0.2032 / 60
    v_FL = entry.get("AMK_FL_ActualVelocity") * 2 * math.pi * 0.2032 / 60
    v_BR = entry.get("AMK_BR_ActualVelocity") * 2 * math.pi * 0.2032 / 60
    v_BL = entry.get("AMK_BL_ActualVelocity") * 2 * math.pi * 0.2032 / 60
    swangle = entry.get("FSM_steeringWheelAngle") * 1000 * math.pi / 180

    # x and y accel
    a_x = entry.get("SBG_Accel_X")
    a_y = entry.get("SBG_Accel_Y")

    v_xf = (v_FR + v_FL) / 2
    v_xr = (v_BR + v_BL) / 2
    v_x = (v_xf + v_xr) / 2

    v_y += a_y * dt

    v_left = (v_FL + v_BL) / 2  # Average speed of left wheels (FL, RL)
    v_right = (v_FR + v_BR) / 2  # Average speed of right wheels (FR, RR)
    
    # Calculate the yaw rate from the difference in wheel speeds
    delta_v = v_right - v_left  # Difference in right-left wheel speeds
    yaw_rate_wheel_speed = delta_v / L
    
    # Calculate yaw rate using the steering angle (SWAngle)
    # Convert steering angle to radians
    swangle_rad = math.radians(swangle)
    
    # Use the steering angle to calculate the turning radius
    turning_radius = L / math.tan(swangle_rad) if swangle_rad != 0 else float('inf')
    
    # Calculate yaw rate using the steering angle and vehicle speed
    yaw_rate_steering = v_x / turning_radius if turning_radius != float('inf') else 0
    
    # Combine both yaw rates: we can take a weighted sum, or use the average (for simplicity)
    yaw_rate = (yaw_rate_wheel_speed + yaw_rate_steering) / 2

    if(ct > 0):
        theta = np.append(theta, theta[ct-1] + yaw_rate * dt)
        x_add = x[ct-1] + (v_x * np.cos(theta[ct]) - v_y * np.sin(theta[ct])) * dt
        y_add = y[ct-1] + (v_x * np.sin(theta[ct]) + v_y * np.cos(theta[ct])) * dt
        x = np.append(x, x_add)
        y = np.append(y, y_add)
        print("x: ", x_add, " y: ", y_add)
    else:
        theta = np.append(theta, 0)
        x = np.append(x, 0)
        y = np.append(y, 0)
    ct = ct + 1


# Example usage
time = np.linspace(0, 10, 100)  # 10 seconds, 100 steps
dt = time[1] - time[0]

# Simulated inputs (constant acceleration, constant steering angle)
wheel_speeds = np.ones((100, 4)) * 5  # All wheels at 5 m/s
imu_data = np.zeros((100, 2))  # No acceleration
steering_angles = np.ones(100) * np.radians(10)  # 10-degree steering

# Run simulation


# Plot result

plt.figure(figsize=(8, 6))
plt.plot(x, y, label='original data', alpha=0.5, c='blue')

#plt.figure(figsize=(8, 6))
#plt.plot(x, y, label='Car Path')
#plt.xlabel('X Position (m)')
#plt.ylabel('Y Position (m)')
#plt.title('Simulated Car Path')
plt.legend()
#plt.axis('equal')
plt.show()