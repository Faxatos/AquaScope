# AIS Data Simulator

These two Python scripts simulate the generation of AIS (Automatic Identification System) pings for vessels, primarily for testing purposes. The scripts randomly generate various vessel data such as position, speed, heading, destination, and timestamp (refer to the [AIS documentation](https://api.vtexplorer.com/docs/response-ais.html) for the full list of fields). The data is continually updated, and the vessels are simulated to move towards their respective destinations.

## Simulators:
- **satellite-data.py**: This script simulates the movement of vessels on the ocean by generating random coordinates and tracking their movements over time.
- **vts-data.py**: This version of the script is a modified version of `satellite-data.py` with parametric latitude and longitude ranges. It allows you to specify an area by providing the minimum and maximum latitude and longitude, and generates AIS pings within that specified area.

## How they works:

1.   **Random Vessel Generation**: Generates random static vessel attributes, including MMSI, IMO, callsign, speed, heading, and starting position on the ocean.
2.   **Destination Calculation**: Assigns each vessel a destination close (range defined by global variable `MAX_DESTINATION_OFFSET`) to its starting location.
3.  **Dynamic Movement**: Simulates the vessel's movement by updating its position over time, considering speed and heading.
4.   **AIS Data Generation**: Continuously generates and updates AIS data, including location, speed, heading, timestamp, and ETA.
5. **New Vessels**: When a vessel reaches its destination, it is removed from the simulation, and a new vessel is generated to maintain the active number of vessels.

## Usage:

Install the required dependencies:
```
 pip install geopandas shapely
 ```
 To run the script simulating the movement of vessels on the open ocean (--vess = number of vessels):
 ```
 python3 satellite-data.py --vess <vess_num> 
 ```
  To run the script simulating the movement of vessels within a specific coordinate range (--vess = number of vessels, latitude and longitude boundaries):
 ```
 python3 vts-data.py --vess <vess_num> --lat_min <min_lat> --lat_max <max_lat> --lon_min <min_lon> --lon_max <max_lon> 
 ```
##  Containerizing the Application

To build a Docker images named `ais-satellite-simulator` and `ais-vts-simulator`, run the following commands:
```
 docker build -t ais-satellite-simulator -f Dockerfile.satellite .
 docker build -t ais-vts-simulator -f Dockerfile.vts .
```

 Once you've built the images, you can run the corresponding containers:
 - To run the containers with the default parameters values (vessels: 10, latitude: [30, 60], longitude: [-120, -60]):
	 ```
	 docker run ais-satellite-simulator
	 docker run ais-vts-simulator
	 ```
- To run the containers with custom parameters values
	 ```
	 docker run ais-satellite-simulator --vess <vess_num>
	docker run ais-vts-simulator --vess <vess_num> --lat_min <min_lat> --lat_max <max_lat> --lon_min <min_lon> --lon_max <max_lon>
	```
 
