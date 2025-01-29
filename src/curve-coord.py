import win32com.client
import numpy as np

# Step 1: Connect to SolidWorks
swApp = win32com.client.Dispatch("SldWorks.Application")
swApp.Visible = True  # Optional: Make SolidWorks visible

# Step 2: Open a drawing file
drawing_file_path = "C:\\path_to_your_drawing_file.slddrw"
swDoc = swApp.OpenDoc6(drawing_file_path, 3, 0, "", 0, 0)

# Step 3: Get the active sheet (assuming only one sheet)
sheet = swDoc.GetCurrentSheet()

# Step 4: Iterate through the entities in the drawing sheet
entities = sheet.GetEntities()
curve_coordinates = []

# Step 5: Loop through entities and get coordinates
for entity in entities:
    # Check if the entity is a curve (such as line, arc, etc.)
    if entity.GetType() in [5, 6]:  # 5 is for lines, 6 is for arcs
        if entity.GetType() == 5:  # Line
            start_point = entity.GetStartPoint()
            end_point = entity.GetEndPoint()
            curve_coordinates.append((start_point[0], start_point[1], start_point[2]))
            curve_coordinates.append((end_point[0], end_point[1], end_point[2]))
        elif entity.GetType() == 6:  # Arc
            center = entity.GetCenter()
            radius = entity.GetRadius()
            start_angle = entity.GetStartAngle()
            end_angle = entity.GetEndAngle()
            # You can generate points along the arc here if needed
            curve_coordinates.append((center[0], center[1], center[2], radius, start_angle, end_angle))

# Step 6: Print the extracted coordinates
for coords in curve_coordinates:
    print(coords)

# Step 7: Optional: Save or use the coordinates as needed
# For example, saving to a file or processing further
