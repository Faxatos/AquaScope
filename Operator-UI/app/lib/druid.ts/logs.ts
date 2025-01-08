import axios from 'axios';
//import { DRUID_SQL_API } from '@/env';
import { VesselLog } from '@/app/lib/definitions'; // Shared type definition

const DRUID_SQL_API = 'http://druid:8888/druid/v2/sql';

export async function fetchVesselLogPage(
  mmsi: string,
  currentPage: number,
  itemsPerPage: number = 10
): Promise<VesselLog[]> {
  const offset = (currentPage - 1) * itemsPerPage;

  // Construct SQL query based on MMSI filter (assuming vessel_logs is the datasource)
  const query = mmsi
    ? `SELECT * FROM vessel_logs WHERE mmsi = ${parseInt(mmsi, 10)} LIMIT ${itemsPerPage} OFFSET ${offset}`
    : `SELECT * FROM vessel_logs LIMIT ${itemsPerPage} OFFSET ${offset}`;

  try {
    const response = await axios.post(DRUID_SQL_API, {
      query,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data as VesselLog[];
  } catch (error) {
    console.error('Error fetching vessel logs from Druid:', error);
    return []; // Return an empty array in case of error
  }
}

export async function fetchTotalLogPages(
  mmsi: string,
  itemsPerPage: number = 10
): Promise<number> {

  // Construct SQL query to count rows (assuming vessel_logs is the datasource)
  const query = mmsi
    ? `SELECT COUNT(*) AS total_logs FROM vessel_logs WHERE mmsi = ${parseInt(mmsi, 10)}`
    : `SELECT COUNT(*) AS total_logs FROM vessel_logs`;

  try {
    const response = await axios.post(DRUID_SQL_API, {
      query,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    const totalLogs = response.data[0]?.total_logs || 0; // Extract total logs count
    return Math.ceil(totalLogs / itemsPerPage);
  } catch (error) {
    console.error('Error fetching total pages from Druid:', error);
    return 0; // Return 0 pages in case of error
  }
}

export async function fetchLatestLogs(): Promise<VesselLog[]> {
  const query = `
    SELECT l.* 
    FROM vessel_logs l
    INNER JOIN (
      SELECT mmsi, MAX("timestamp") AS max_timestamp
      FROM vessel_logs
      GROUP BY mmsi
    ) latest
    ON l.mmsi = latest.mmsi AND l."timestamp" = latest.max_timestamp
  `;

  try {
    const response = await axios.post(DRUID_SQL_API, {
      query,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data as VesselLog[];
  } catch (error) {
    console.error('Error fetching latest logs from Druid:', error);
    return []; // Return an empty array in case of error
  }
}