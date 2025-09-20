time: Time in seconds. Initial time is 0. Intervals of 0.1s (any smaller results in interpolation noise)
PacketCounter: counter by the Movella GPS. Used to determine time
StatusWord: Status of GPS reading. Includes information such as estimated error. Consult the Movella docs for more info.

*Unchanged from the Movella:*
*Note: ENU coordinates, rotation is aerospace coordinates (yaw-pitch-roll)*
Acc_X
Acc_Y
Acc_Z
FreeAcc_E
FreeAcc_N
FreeAcc_U
Gyr_X
Gyr_Y
Gyr_Z
Vel_E
Vel_N
Vel_U
Latitude
Longitude

*Unchanged from CAN:*
FSM_steeringWheelAngleADC
AMK_FR_TorqueLimitPositiv
AMK_FL_TorqueLimitPositiv
AMK_RR_TorqueLimitPositiv
AMK_BL_TorqueLimitPositiv
AMK_FR_ActualVelocity
AMK_FL_ActualVelocity
AMK_BR_ActualVelocity
AMK_BL_ActualVelocity
AMK_FR_TorqueLimitNegativ
AMK_FL_TorqueLimitNegativ
AMK_RR_TorqueLimitNegativ
AMK_BL_TorqueLimitNegativ
FSM_brakePressureFront

*Note: x points towards east, y points towards north, Cartesian coordinates so yaw is the angle from x-axis to y-axis*
x_movella : x coordinate of the Movella IMU (m) - Derived from Latitude/Longitude
y_movella : y coordinate of the Movella IMU (m) - Derived from Latitude/Longitude
x : x coordinate of the vehicle's CM (m) - Derived from x_movella and current yaw
y : y coordinate of the vehicle's CM (m) - Derived from y_movella and current yaw
rotation: Scipy Rotation object derived from Movella's quaternion output
yaw: yaw of the vehicle's CM (rad)
pitch: pitch of the vehicle's CM (rad)
roll: roll of the vehicle's CM (rad)
yawdot: yaw rate of the vehicle's CM (rad/s)
xdot: x velocity of the vehicle's CM (m/s)
ydot: y velocity of the vehicle's CM (m/s)
vlong: velocity of the vehicle's CM along the car (m/s)
vlat: velocity of the vehicle's CM (left) across the car (m/s)
vlong_movella: velocity of the Movella IMU along the car (m/s)
vlat_movella: velocity of the Movella IMU (left) across the car (m/s)
v: net speed of the vehicle's CM (m/s)
swangle: steering wheel angle (rad)
torque: torque applied to the vehicle's CM (Nm)
front_torque: torque applied to the front wheels (Nm)
rear_torque: torque applied to the rear wheels (Nm)
front_wheel_speed: speed of the front wheels (m/s)
rear_wheel_speed: speed of the rear wheels (m/s)
xdoubledot: equal to FreeAcc_E
ydoubledot: equal to FreeAcc_N
along: rate of change of vlong (m/s^2) - Derived from Movella's FreeAcc_E and FreeAcc_N and yaw
alat: rate of change of vlat (m/s^2) - Derived from Movella's FreeAcc_E and FreeAcc_N and yaw
along_old: along but shifted by 1 sample, used for load transfer estimation
*Note: the following are all other ways of obtaining along/alat, and they are slightly different. I think the original along/alat above are the most accurate.*
along_raw: equal to Acc_X, in theory same as along
alat_raw: equal to Acc_Y, in theory same as alat
along_pred2: same as along but derived from FreeAcc_E, FreeAcc_N and all 3 euler angles
alat_pred2: same as alat but derived from FreeAcc_E, FreeAcc_N and all 3 euler angles
avert_pred2:

*Note: The following are derived from (vlong, vlat, yaw_rate, steering_angle, front_wheel_speed, rear_wheel_speed). I also do not think they are very accurate :( *
front_slip_ratio
rear_slip_ratio
front_slip_angle
rear_slip_angle





