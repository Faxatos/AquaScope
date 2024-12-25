//import { sql } from '@vercel/postgres';
import { Vessel, VesselLog, Alarm } from './definitions';
import { vessels, vesselLogs, alarms } from './placeholder-data';

// Fetch static vessel data by mmsi
export async function fetchVesselInfosPage(mmsi: string, currentPage: number, itemsPerPage: number = 10): Promise<Vessel[]> {
  if (mmsi === "") {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return vessels.slice(startIndex, startIndex + itemsPerPage); // Return a page of all vessels
  }

  // Try to parse MMSI string to a number
  const mmsiNumber = parseInt(mmsi, 10);

  // If MMSI cannot be parsed into a valid number, handle the case accordingly
  if (isNaN(mmsiNumber)) {
    console.error('Invalid MMSI value:', mmsi);
    return []; // Or return a suitable fallback value (like empty array)
  }

  // Filter vessels by the parsed MMSI number
  const filteredVessels = vessels.filter((vessel) => vessel.mmsi === mmsiNumber);

  // Paginate the filtered vessels
  const startIndex = (currentPage - 1) * itemsPerPage;
  return filteredVessels.slice(startIndex, startIndex + itemsPerPage);
}

// Fetch the total number of pages for vessels
export async function fetchTotalVesselInfosPage(mmsi: string, itemsPerPage: number = 10): Promise<number> {
  if (mmsi === "") {
    const totalPages = Math.ceil(vessels.length / itemsPerPage);
    return totalPages; // Calculate and return total pages for all vessels
  }

  // Try to parse MMSI string to a number
  const mmsiNumber = parseInt(mmsi, 10);

  // If MMSI cannot be parsed into a valid number, handle the case accordingly
  if (isNaN(mmsiNumber)) {
    console.error('Invalid MMSI value:', mmsi);
    return 0; // Return 0 if MMSI is invalid
  }

  // Filter vessels by the parsed MMSI number
  const filteredVessels = vessels.filter((vessel) => vessel.mmsi === mmsiNumber);

  // Calculate and return the total number of pages based on the filtered vessels list
  const totalPages = Math.ceil(filteredVessels.length / itemsPerPage);
  return totalPages;
}

// Fetch a page of vessel logs
export async function fetchVesselLogPage(mmsi: string, currentPage: number, itemsPerPage: number = 10): Promise<VesselLog[]> {
  if (mmsi === "") {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return vesselLogs.slice(startIndex, startIndex + itemsPerPage);
  }

  // Try to parse mmsi string to a number
  const mmsiNumber = parseInt(mmsi, 10);

  // If mmsi cannot be parsed into a valid number, handle the case accordingly
  if (isNaN(mmsiNumber)) {
    console.error('Invalid MMSI value:', mmsi);
    return []; // Or return a suitable fallback value (like 0)
  }

  const logs = vesselLogs.filter((log) => log.mmsi === mmsiNumber);

  // Filter logs by the parsed mmsi number
  const startIndex = (currentPage - 1) * itemsPerPage;
  return logs.slice(startIndex, startIndex + itemsPerPage);
}

// Fetch the total number of pages for logs
export async function fetchTotalLogPages(mmsi: string, itemsPerPage: number = 10): Promise<number> {
  if (mmsi === "") {
    const totalPages = Math.ceil(vesselLogs.length / itemsPerPage);
    return totalPages;
  }

  // Try to parse mmsi string to a number
  const mmsiNumber = parseInt(mmsi, 10);

  // If mmsi cannot be parsed into a valid number, handle the case accordingly
  if (isNaN(mmsiNumber)) {
    console.error('Invalid MMSI value:', mmsi);
    return 0; // Or return a suitable fallback value (like 0)
  }

  const logs = vesselLogs.filter((log) => log.mmsi === mmsiNumber);

  // Calculate and return the total number of pages based on the filtered log list
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  return totalPages;
}

export async function fetchTotalAlarmPages(mmsi: string, itemsPerPage: number = 10): Promise<number> {
  // If mmsi is an empty string, return the total number of pages for the entire alarms list
  if (mmsi === "") {
    const totalPages = Math.ceil(alarms.length / itemsPerPage);
    return totalPages;
  }

  // Try to parse mmsi string to a number
  const mmsiNumber = parseInt(mmsi, 10);

  // If mmsi cannot be parsed into a valid number, handle the case accordingly
  if (isNaN(mmsiNumber)) {
    console.error('Invalid MMSI value:', mmsi);
    return 0; // Or return a suitable fallback value (like 0)
  }

  // Filter alarms by the parsed mmsi number
  const alarmList = alarms.filter((alarm) => alarm.mmsi === mmsiNumber);

  // Calculate and return the total number of pages based on the filtered alarm list
  const totalPages = Math.ceil(alarmList.length / itemsPerPage);
  return totalPages;
}

// Fetch a page of alarms
export async function fetchAlarmPage(mmsi: string, currentPage: number, itemsPerPage: number = 10) {
  // If mmsi is an empty string, return the alarm list without filtering
  if (mmsi === "") {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return alarms.slice(startIndex, startIndex + itemsPerPage);
  }

  // Try to parse mmsi string to a number
  const mmsiNumber = parseInt(mmsi, 10);

  // If mmsi cannot be parsed into a valid number, handle the case accordingly
  if (isNaN(mmsiNumber)) {
    console.error('Invalid MMSI value:', mmsi);
    return []; // Or return a suitable error message or empty array
  }

  // Filter alarms by the parsed mmsi number
  const alarmList = alarms.filter((alarm) => alarm.mmsi === mmsiNumber);
  const startIndex = (currentPage - 1) * itemsPerPage;
  return alarmList.slice(startIndex, startIndex + itemsPerPage);
}

// methods requiring a real postgres db:
/*export async function fetchVesselStaticData(mmsi: number) {
  try {
    const data = await sql<Vessel>`SELECT * FROM vessels WHERE mmsi = ${mmsi}`;
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch vessel static data.');
  }
}

export async function fetchVesselLogPage(mmsi: number, currentPage: number, itemsPerPage: number = 10) {
  const offset = (currentPage - 1) * itemsPerPage;

  try {
    const logs = await sql<VesselLog>`
      SELECT * FROM vessel_logs
      WHERE mmsi = ${mmsi}
      ORDER BY timestamp DESC
      LIMIT ${itemsPerPage} OFFSET ${offset}`;

    return logs.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch paginated vessel logs.');
  }
}


export async function fetchTotalLogPages(mmsi: number, itemsPerPage: number = 10) {
  try {
    const count = await sql`SELECT COUNT(*) AS total
      FROM vessel_logs
      WHERE mmsi = ${mmsi}`;

    const totalPages = Math.ceil(Number(count.rows[0].total) / itemsPerPage);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total log pages.');
  }
}

export async function fetchTotalAlarmPages(mmsi: number, itemsPerPage: number = 10) {
  try {
    const count = await sql`SELECT COUNT(*) AS total
      FROM alarms
      WHERE mmsi = ${mmsi}`;

    const totalPages = Math.ceil(Number(count.rows[0].total) / itemsPerPage);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total alarm pages.');
  }
}

export async function fetchAlarmPage(mmsi: number, currentPage: number, itemsPerPage: number = 10) {
  const offset = (currentPage - 1) * itemsPerPage;

  try {
    const alarms = await sql<Alarm>`
      SELECT * FROM alarms
      WHERE mmsi = ${mmsi}
      ORDER BY timestamp DESC
      LIMIT ${itemsPerPage} OFFSET ${offset}`;

    return alarms.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch paginated alarms.');
  }
}

export async function fetchAlarmsByVessel(mmsi: number) {
  try {
    const data = await sql<Alarm>`
      SELECT * FROM alarms
      WHERE mmsi = ${mmsi}
      ORDER BY timestamp DESC`;

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch alarms for the vessel.');
  }
}

export async function fetchAlarmDetails(alarmId: string) {
  try {
    const data = await sql<Alarm>`
      SELECT * FROM alarms
      WHERE alarm_id = ${alarmId}`;

    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch alarm details.');
  }
}*/