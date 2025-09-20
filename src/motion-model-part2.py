import numpy as np
import matplotlib.pyplot as plt


# fake data to at least check if this shit works

# function to convert lat/lon to local meters
def latlon_to_meters(lat, lon, ref_lat, ref_lon):
    R = 6371000  # earth radius in meters

    # ensure inputs are numpy arrays
    lat = np.asarray(lat, dtype=np.float64)
    lon = np.asarray(lon, dtype=np.float64)
    ref_lat = np.asarray(ref_lat, dtype=np.float64)
    ref_lon = np.asarray(ref_lon, dtype=np.float64)

    # now it's safe to convert to radians
    lat, lon = np.radians(lat), np.radians(lon)
    ref_lat, ref_lon = np.radians(ref_lat), np.radians(ref_lon)

    # compute x and y distances
    x = (lon - ref_lon) * np.cos(ref_lat) * R
    y = (lat - ref_lat) * R

    return x, y



# kinematic bicycle model function
def kinematic_bicycle_model(x0, y0, theta0, velocity, steering_angle, dt, L):
# predicting next state (iterative calcs)
    beta = np.arctan(0.5 * np.tan(steering_angle))  # slip angle approx.
    x_next = x0 + velocity * np.cos(theta0 + beta) * dt
    y_next = y0 + velocity * np.sin(theta0 + beta) * dt
    theta_next = theta0 + (velocity / L) * np.tan(steering_angle) * dt  # change in heading
    
    return x_next, y_next, theta_next

# function to process raceline
def process_raceline(lat, lon, velocity, steering_angle, dt=0.02, L=2.5):
#taking points and moving them over 
    # convert lat/lon to meters
    ref_lat, ref_lon = lat[0], lon[0]  # use first point as reference
    x, y = latlon_to_meters(lat, lon, ref_lat, ref_lon)

    # initialize heading using the first valid movement
    dx, dy = x[1] - x[0], y[1] - y[0]
    theta = [np.arctan2(dy, dx)]  # set initial

    # ensure steering angles are in radians
    steering_angle = np.asarray(steering_angle)
    if np.max(np.abs(steering_angle)) > np.pi:
        steering_angle = np.radians(steering_angle)

    # clamping
    steering_angle = np.clip(steering_angle, np.radians(-25), np.radians(25))

    x_smooth, y_smooth = [x[0]], [y[0]]
    
    for i in range(1, len(velocity)):
        x_next, y_next, theta_next = kinematic_bicycle_model(
            x_smooth[-1], y_smooth[-1], theta[-1], velocity[i], steering_angle[i], dt, L)
        x_smooth.append(x_next)
        y_smooth.append(y_next)
        theta.append(theta_next)

    return np.array(x_smooth), np.array(y_smooth)

# simulated example data
num_points = 400

# generate lat/lon data for a realistic racetrack-like curve
track_radius = 20 # meters
theta = np.linspace(0, 2 * np.pi, num_points)  # full loop

latitudes = 37.7749 + (track_radius / 111111) * np.sin(theta)  # approximate conversion meters → degrees
longitudes = -122.4194 + (track_radius / (111111 * np.cos(np.radians(37.7749)))) * np.cos(theta)

# generate velocity with smooth acceleration and braking
velocity_data = np.clip(20 + 5 * np.sin(theta * 3), 10, 35)

# generate steering angle with realistic turns
steering_angle_data = np.degrees(0.1 * np.sin(np.linspace(0, 2*np.pi, num_points) * 2))  # Reduce steering changes

# wee woo


# process raceline
x_smooth, y_smooth = process_raceline(latitudes, longitudes, velocity_data, steering_angle_data)

# plot results
plt.figure(figsize=(10, 6))
plt.plot(x_smooth, y_smooth, label="smoothed raceline", linewidth=2)
plt.scatter(*latlon_to_meters(latitudes, longitudes, latitudes[0], longitudes[0]), s=10, color="red", label="raw gps")
plt.xlabel("x position (meters)")
plt.ylabel("y position (meters)")
plt.legend()
plt.title("model raceline w sample data")
plt.show()
