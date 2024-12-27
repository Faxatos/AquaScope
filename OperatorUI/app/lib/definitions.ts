// For simplicity, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

// Static values for the vessel
export type Vessel = {
  mmsi: number; // Maritime Mobile Service Identity
  imo: number; // International Maritime Organization number
  callsign: string; // Unique call sign of the vessel
  a: number; // Dimension A (distance from the bow to the AIS unit)
  b: number; // Dimension B (distance from the AIS unit to the stern)
  c: number; // Dimension C (distance from the port side to the AIS unit)
  d: number; // Dimension D (distance from the starboard side to the AIS unit)
  draught: number; // Vessel's draught (meters)
};

// Dynamic values saved in logs with vessel id as mmsi
export type VesselLog = {
  timestamp: string; // Timestamp of the vessel's last update (ISO 8601 format)
  mmsi: number; // MMSI of the vessel
  locode: string; // Location code of the destination port
  zone: string; // Navigational zone
  eca: boolean; // Indicates if the vessel is in an Emission Control Area
  src: string; // Source of the data (e.g., "SAT")
  latitude: number; // Current latitude of the vessel
  longitude: number; // Current longitude of the vessel
  course: number; // Current course (degrees)
  speed: number; // Current speed (knots)
  eta_ais: string; // Estimated Time of Arrival (from AIS)
  dest_lat: number; // Destination latitude
  dest_lon: number; // Destination longitude
};

// Represents an alarm associated with a vessel
export type Alarm = {
  timestamp: string; // Timestamp when the alarm was triggered (ISO 8601 format)
  alarm_id: string; // Unique identifier for the alarm
  mmsi: number; // Associated vessel's ID
  code: string; // Unique code for the type of alarm
  description: string; // Detailed description of the alarm
  status: 'active' | 'resolved'; // Current status of the alarm
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

