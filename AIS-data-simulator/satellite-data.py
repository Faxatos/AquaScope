import random
import uuid
from datetime import datetime, timedelta
import json
#from kafka import KafkaProducer

# Constants
WORLD_LAT_RANGE = (-90.0, 90.0)
WORLD_LON_RANGE = (-180.0, 180.0)
DEFAULT_SPEED = (5, 20)  # Knots
ETA_UPDATE_INTERVAL = 10  # We assume to get data every 10 seconds

# Helper functions
def generate_random_coordinates():
    return round(random.uniform(*WORLD_LAT_RANGE), 6), round(random.uniform(*WORLD_LON_RANGE), 6)

def calculate_new_position(lat, lon, speed, heading, time_interval):
    # Basic approximation for new position
    distance = (speed * 1852) * (time_interval / 3600)  # Convert knots to meters and time to hours
    delta_lat = distance * math.cos(math.radians(heading)) / 111320  # 1 degree latitude = ~111.32 km
    delta_lon = distance * math.sin(math.radians(heading)) / (111320 * math.cos(math.radians(lat)))
    return round(lat + delta_lat, 6), round(lon + delta_lon, 6)

def random_heading():
    return random.randint(0, 359)

def random_speed():
    return round(random.uniform(*DEFAULT_SPEED), 2)

def generate_vessel():
    lat, lon = generate_random_coordinates()
    destination_lat, destination_lon = generate_random_coordinates()

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
        "SRC": "SAT"
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
        "TIMESTAMP": datetime.utcnow().isoformat(),
    })

    return vessel

def calculate_eta(lat, lon, dest_lat, dest_lon, speed):
    # Haversine formula approximation for distance
    distance = haversine_distance(lat, lon, dest_lat, dest_lon)
    hours = distance / speed if speed > 0 else float("inf")
    return (datetime.utcnow() + timedelta(hours=hours)).isoformat()

def haversine_distance(lat1, lon1, lat2, lon2):
    # Calculate distance between two lat/lon pairs in nautical miles
    from math import radians, sin, cos, sqrt, atan2
    R = 6371  # Earth radius in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance_km = R * c
    return distance_km / 1.852  # Convert km to nautical miles

def update_vessel(vessel):
    # Update timestamp
    vessel["TIMESTAMP"] = datetime.utcnow().isoformat()

    # Update position
    vessel["LATITUDE"], vessel["LONGITUDE"] = calculate_new_position(
        vessel["LATITUDE"], vessel["LONGITUDE"], vessel["SPEED"], vessel["COURSE"], ETA_UPDATE_INTERVAL
    )

    # Decrease ETA_AIS
    eta_time = datetime.fromisoformat(vessel["ETA_AIS"])
    eta_time -= timedelta(seconds=ETA_UPDATE_INTERVAL)

    # If ETA_AIS reaches 0, return False to indicate vessel removal
    if eta_time <= datetime.utcnow():
        return False

    vessel["ETA_AIS"] = eta_time.isoformat()
    return True

def simulate_vessels():
    vessels = [generate_vessel() for _ in range(5)]

    while True:
        print(f"=== Current Vessel Data @ {datetime.utcnow().isoformat()} ===")
        for vessel in vessels[:]:  # Iterate over a copy of the list
            if not update_vessel(vessel):
                print(f"Vessel {vessel['MMSI']} reached destination. Removing.")
                vessels.remove(vessel)
                vessels.append(generate_vessel())
            print(vessel)
            #with open("simulated_ais_data.json", "w") as f:
            #    json.dump(vessel, f, indent=4)

        time.sleep(ETA_UPDATE_INTERVAL)  # Wait before the next update

if __name__ == "__main__":
    import math
    import time
    simulate_vessels()