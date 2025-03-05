import json
import numpy as np
import matplotlib.pyplot as plt
import math

with open("lap_6.json") as f:

    json_data = json.load(f)

    init_offset_meters_x = 0
    init_offset_meters_y = 0
    first_data_processed = False

    x_real = np.array([])
    y_real = np.array([])

    x_model = np.array([])
    y_model = np.array([])

    v_x = 0
    v_y = 0

    dt = 0.0025
    ct = 0

    heading = 0

    for entry in json_data:


        # getting actual coordinates
        lat = entry.get("SBG_Latitude")
        lon = entry.get("SBG_Longitude")

        # converting to meters
        x_meters = lon * 111319.5 * math.cos(lat)
        y_meters = lat * 111111
        if not first_data_processed:
            init_offset_meters_x = x_meters
            init_offset_meters_y = y_meters
            first_data_processed = True
            x_model = np.append(x_model, 0)
            y_model = np.append(y_model, 0)
        x_real = np.append(x_real, x_meters - init_offset_meters_x)
        y_real = np.append(y_real, y_meters - init_offset_meters_y)

        # getting x and y accel
        a_x = entry.get("SBG_Accel_X")
        a_y = entry.get("SBG_Accel_Y")

        swangle = entry.get("FSM_steeringWheelAngle") * 1000 * math.pi / 180
        
        for i in range (0, 4):
            v = math.sqrt(v_x ** 2 + v_y ** 2)
            yaw_rate = (v / 1.5) * np.tan(swangle)
            heading += yaw_rate * dt
            
            # correcting for direction
            acc_x = a_x * math.cos(heading) - a_y * math.sin(heading)
            acc_y = a_y * math.cos(heading) + a_x * math.sin(heading)

            # getting x and y velocity from accel
            v_x += acc_x * dt
            v_y += acc_y * dt

            # plotting intermediate point
            x_model = np.append(x_model, x_model[ct] + v_x * dt)
            y_model = np.append(y_model, y_model[ct] + v_y * dt)
            ct = ct + 1

    plt.figure(figsize=(8, 6))
    plt.plot(x_model, y_model, label='motion model', alpha=0.5, c='blue')
    plt.plot(x_real, y_real, label='original data', alpha=0.5, c='red')
    plt.legend()
    plt.show()

