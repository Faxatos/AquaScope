import random
import uuid
from datetime import datetime, timedelta, timezone
import json
import geopandas as gpd
from shapely.geometry import Point
import os
import argparse 
from kafka import KafkaProducer

from dotenv import load_dotenv

load_dotenv()

# Constants
DEFAULT_SPEED = (5, 20)  # Knots
ETA_UPDATE_INTERVAL = 10  # We assume to get data every 10 seconds
MAX_DESTINATION_OFFSET = 1  # Max offset for destination in degrees (about 60 nautical miles)

# Kafka Configuration
KAFKA_SERVER = os.getenv('KAFKA_SERVER')
TOPIC = os.getenv('TOPIC', 'sat')

# Initialize Kafka Producer
producer = KafkaProducer(
    bootstrap_servers=[KAFKA_SERVER],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Helper functions
def load_ocean_shapefile(filepath):
    """
    Loads a shapefile of global oceans into a GeoDataFrame.
    """
    return gpd.read_file(filepath)

# Check if a point is on land
def is_in_ocean(lat, lon, ocean_gdf):
    """
    Checks if the given latitude and longitude are in the ocean.
    
    Args:
    - lat (float): Latitude of the point.
    - lon (float): Longitude of the point.
    - ocean_gdf (GeoDataFrame): GeoDataFrame containing ocean polygons.
    
    Returns:
    - bool: True if the point is in the ocean, False if it's on land.
    """
    point = Point(lon, lat)  # Note: GeoPandas uses (longitude, latitude)
    return ocean_gdf.contains(point).any()

def generate_random_coordinates_in_area(ocean_gdf, lat_range, lon_range):
    """
    Generates random coordinates inside a given area (latitude and longitude range) and ensures they are on water.
    
    Args:
    - ocean_gdf (GeoDataFrame): GeoDataFrame containing ocean polygons.
    - lat_range (tuple): Latitude range (min, max).
    - lon_range (tuple): Longitude range (min, max).
    
    Returns:
    - tuple: (lat, lon) coordinates that are on water within the given area.
    """
    while True:
        lat = round(random.uniform(*lat_range), 6)
        lon = round(random.uniform(*lon_range), 6)
        if is_in_ocean(lat, lon, ocean_gdf):
            return lat, lon
    
def generate_destination_coordinates(lat, lon):
    """
    Generates a destination coordinate close to the initial coordinate (lat, lon).
    
    Args:
    - lat (float): Latitude of the origin.
    - lon (float): Longitude of the origin.
    
    Returns:
    - tuple: (destination_lat, destination_lon) coordinates close to the origin.
    """
    # Generate random offsets for the destination within a small range
    lat_offset = random.uniform(-MAX_DESTINATION_OFFSET, MAX_DESTINATION_OFFSET)
    lon_offset = random.uniform(-MAX_DESTINATION_OFFSET, MAX_DESTINATION_OFFSET)
    
    # Ensure the destination stays within valid geographic bounds
    destination_lat = lat + lat_offset
    destination_lon = lon + lon_offset
    
    # Make sure destination is still within valid ranges
    destination_lat = max(min(destination_lat, 90.0), -90.0)
    destination_lon = max(min(destination_lon, 180.0), -180.0)

    return round(destination_lat, 6), round(destination_lon, 6)

def calculate_new_position(lat, lon, speed, heading, time_interval):
    """
    Calculates the new position of a vessel given its current position, speed, and heading.
    """
    distance = (speed * 1852) * (time_interval / 3600)  # Convert knots to meters and time to hours
    delta_lat = distance * math.cos(math.radians(heading)) / 111320  # 1 degree latitude = ~111.32 km
    delta_lon = distance * math.sin(math.radians(heading)) / (111320 * math.cos(math.radians(lat)))
    return round(lat + delta_lat, 6), round(lon + delta_lon, 6)

def random_heading():
    return random.randint(0, 359)

def random_speed():
    """
    Generates a random speed within the given range (See DEFAULT_SPEED const).
    """
    return round(random.uniform(*DEFAULT_SPEED), 2)

def generate_vessel(ocean_gdf, lat_range, lon_range):
    """
    Generates a random vessel with dynamic attributes.
    """
    lat, lon = generate_random_coordinates_in_area(ocean_gdf, lat_range, lon_range)
    destination_lat, destination_lon = generate_destination_coordinates(lat, lon)

    # Debugging print statement for coordinates
    print(f"Generated coordinates: {lat}, {lon}")
    print(f"Generated destination coordinates: {destination_lat}, {destination_lon}")

    # Static data
    vessel = {
        "MMSI": random.randint(100000000, 999999999),
        "IMO": random.randint(1000000, 9999999),
        "CALLSIGN": str(uuid.uuid4())[:7].upper(),
        "A": random.randint(10, 50),
        "B": random.randint(10, 50),
        "C": random.randint(5, 20),
        "D": random.randint(5, 20),
        "DRAUGHT": round(random.uniform(5.0, 20.0), 1),
        "DESTINATION": f"Port-{random.randint(1, 100)}",
        "LOCODE": f"LOC-{random.randint(1, 100)}",
        "ZONE": f"Zone-{random.randint(1, 10)}",
        "ECA": random.choice([True, False]),
        "SRC": "TER"
    }

    # Dynamic data
    speed = random_speed()
    heading = random_heading()
    eta = calculate_eta(lat, lon, destination_lat, destination_lon, speed)

    vessel.update({
        "LATITUDE": lat,
        "LONGITUDE": lon,
        "COURSE": heading,
        "SPEED": speed,
        "ETA_AIS": eta,
        "DEST_LAT": destination_lat,
        "DEST_LON": destination_lon,
        "TIMESTAMP": datetime.now(timezone.utc).isoformat(),
    })

    return vessel

def calculate_eta(lat, lon, dest_lat, dest_lon, speed):
    """
    Calculates the ETA based on the current position and destination.
    """
    distance = haversine_distance(lat, lon, dest_lat, dest_lon)
    hours = distance / speed if speed > 0 else float("inf")
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculates the Haversine distance between two coordinates in nautical miles.
    """
    from math import radians, sin, cos, sqrt, atan2
    R = 6371  # Earth radius in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance_km = R * c
    return distance_km / 1.852  # Convert km to nautical miles

def update_vessel(vessel):
    """
    Updates the vessel's position and ETA.
    """

    # Update timestamp
    vessel["TIMESTAMP"] = datetime.now(timezone.utc).isoformat()

    # Update position
    vessel["LATITUDE"], vessel["LONGITUDE"] = calculate_new_position(
        vessel["LATITUDE"], vessel["LONGITUDE"], vessel["SPEED"], vessel["COURSE"], ETA_UPDATE_INTERVAL
    )

    # Decrease ETA_AIS
    eta_time = datetime.fromisoformat(vessel["ETA_AIS"])
    eta_time -= timedelta(seconds=ETA_UPDATE_INTERVAL)

    # If ETA_AIS reaches 0, return False to indicate vessel removal
    if eta_time <= datetime.now(timezone.utc):
        return False

    vessel["ETA_AIS"] = eta_time.isoformat()
    return True

def simulate_vessels(ocean_gdf, lat_range, lon_range, vess_num):
    vessels = [generate_vessel(ocean_gdf, lat_range, lon_range) for _ in range(vess_num)]

    while True:
        print(f"=== Current Vessel Data @ {datetime.now(timezone.utc).isoformat()} ===")
        for vessel in vessels[:]:  # Iterate over a copy of the list
            if not update_vessel(vessel):
                print(f"Vessel {vessel['MMSI']} reached destination. Removing.")
                vessels.remove(vessel)
                vessels.append(generate_vessel(ocean_gdf, lat_range, lon_range))
            print(vessel)

            # Send the vessel data to Kafka
            try:
                future = producer.send(TOPIC, value=vessel)
                future.get(timeout=10)  # Add a timeout for safety
                producer.flush()
            except Exception as e:
                print(f"Failed to send vessel data to Kafka: {e}")

        time.sleep(ETA_UPDATE_INTERVAL)  # Wait before the next update

if __name__ == "__main__":
    import math
    import time

    shapefile_path = "natural_earth_oceans/ne_110m_ocean.shp"

    # Command-line arguments parsing
    parser = argparse.ArgumentParser(description="Simulate vessels within a specified area.")
    parser.add_argument('--vess', type=int, required=True, help="Number of vessels to simulate.")
    parser.add_argument('--lat_min', type=float, required=True, help="Minimum latitude of the area.")
    parser.add_argument('--lat_max', type=float, required=True, help="Maximum latitude of the area.")
    parser.add_argument('--lon_min', type=float, required=True, help="Minimum longitude of the area.")
    parser.add_argument('--lon_max', type=float, required=True, help="Maximum longitude of the area.")
    args = parser.parse_args()
    
    # Load the land GeoDataFrame
    ocean_gdf = load_ocean_shapefile(shapefile_path)
    
    # Define the area (latitude and longitude ranges) where you want to generate coordinates
    lat_range = (args.lat_min, args.lat_max)
    lon_range = (args.lon_min, args.lon_max)
    vess_num = args.vess
    
    # Start the vessel simulation
    simulate_vessels(ocean_gdf, lat_range, lon_range, vess_num)
