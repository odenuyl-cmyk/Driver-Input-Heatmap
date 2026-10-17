# Driver Input Heatmap

A web dashboard that shows **where a driver is on throttle and brake around the track**, so laps can be compared side by side. Built for Carnegie Mellon Racing from the car's logged data.

<img width="2100" height="1050" alt="image" src="https://github.com/user-attachments/assets/67506973-078d-4105-b40a-03a0c57eef62" />


## Features

- **Track-map heatmap:** the GPS path is colored by throttle (green) and brake (red), scaled per lap. Toggle either channel and hover for exact percentages.
- **Lap comparison:** view any two laps next to each other, or step through laps one at a time.
- **Input graphs:** brake pressure and throttle position over time for the selected lap.
- **Log import:** load a raw `.mdf` log in the browser; a Python script resamples it and splits it into laps.

## Run it

```bash
npm install
npm run dev        # open the local URL Vite prints
```

The app opens with a few bundled sample laps (track map only). To load your own data, click **Import** and pick an `.mdf` log. Import runs through the dev server and needs Python 3 available as `python`:

```bash
pip install asammdf numpy
```

## Data

Logs are expected to use the team's CAN and GPS channel names (for example `FSM_throttlePos`, `FSM_brakePressureFront`, `Movella_Latitude`). Columns are described in [`column_description.md`](column_description.md).

## Stack

React 18 · Vite · Chart.js · HTML canvas · Python (asammdf, NumPy)

## Credits

Built by members of Carnegie Mellon Racing (see Contributors)
