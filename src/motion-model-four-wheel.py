import json
import numpy as np
import matplotlib.pyplot as plt
import math

init_offset_meters_x = 0
init_offset_meters_y = 0
first_data_processed = False

with open("lap_6.json") as f:
    
    json_data = json.load(f)

# Vehicle parameters
L_f = 0.75  # Distance from CG to front axle (m)
L_r = 0.75  # Distance from CG to rear axle (m)
L = L_f + L_r  # Wheelbase (m)
W = 1.2  # Track width (m)

x, y, theta = np.array([]), np.array([]), np.array([])
x_real, y_real = np.array([]), np.array([])
v_x, v_y, omega = 0, 0, 0
ct = 0
dt = 0.01
#prev_t = 0

for entry in json_data:

    lat = entry.get("SBG_Latitude")
    lon = entry.get("SBG_Longitude")
    x_meters = lon * 111319.5 * math.cos(lat)
    y_meters = lat * 111111
    if not first_data_processed:
        init_offset_meters_x = x_meters
        init_offset_meters_y = y_meters
        first_data_processed = True
    x_real = np.append(x_real, x_meters - init_offset_meters_x)
    y_real = np.append(y_real, y_meters - init_offset_meters_y)

    #if(ct > 0):
    #    dt = entry.get("t_1") - prev_t
    #    prev_t = entry.get("t_1")
    # wheel speeds
    v_FR = entry.get("AMK_FR_ActualVelocity") * 2 * math.pi * 0.2032 / 60
    v_FL = entry.get("AMK_FL_ActualVelocity") * 2 * math.pi * 0.2032 / 60
    v_BR = entry.get("AMK_BR_ActualVelocity") * 2 * math.pi * 0.2032 / 60
    v_BL = entry.get("AMK_BL_ActualVelocity") * 2 * math.pi * 0.2032 / 60

    # x and y accel
    a_x = entry.get("SBG_Accel_X")
    a_y = entry.get("SBG_Accel_Y")

    v_xf = (v_FR + v_FL) / 2
    v_xr = (v_BR + v_BL) / 2
    v_x = (v_xf + v_xr) / 2

    v_y += a_y * dt

    yaw_rate_front_back = (v_xf - v_xr) / L  
    yaw_rate_left_right = ((v_FR - v_FL) + (v_BR - v_BL)) / (2 * W)
    omega = yaw_rate_front_back + yaw_rate_left_right

    if(ct > 0):
        theta = np.append(theta, theta[ct-1] + omega * dt)
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



plt.figure(figsize=(8, 6))
plt.plot(x, y, label='motion model', alpha=0.5, c='blue')
plt.plot(x_real, y_real, label='original data', alpha=0.5, c='red')

#plt.figure(figsize=(8, 6))
#plt.plot(x, y, label='Car Path')
#plt.xlabel('X Position (m)')
#plt.ylabel('Y Position (m)')
#plt.title('Simulated Car Path')
plt.legend()
#plt.axis('equal')
plt.show()