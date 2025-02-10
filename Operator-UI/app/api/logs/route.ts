import axios from 'axios';
import { NextResponse } from 'next/server';
import { VesselLog } from '@/app/lib/definitions'; // Assuming your type definitions are in this file

const DRUID_SQL_API = 'http://druid-router.druid.svc.cluster.local:8888/druid/v2/sql';

// Fetch logs from the database with optional MMSI filtering
async function fetchVesselLogPage(mmsi: string, currentPage: number, itemsPerPage: number) {
  const offset = (currentPage - 1) * itemsPerPage;
  let query = '';

  // If mmsi is provided, filter logs by MMSI, otherwise get all logs
  if (mmsi && mmsi.trim() !== '') {
    const parsedMmsi = parseInt(mmsi, 10);
    query = `
      SELECT * FROM (
        SELECT * FROM vessel_logs_vts WHERE MMSI = ${parsedMmsi} ORDER BY __time DESC LIMIT ${itemsPerPage}
        UNION ALL
        SELECT * FROM vessel_logs_sat WHERE MMSI = ${parsedMmsi} ORDER BY __time DESC LIMIT ${itemsPerPage}
      ) combined
      ORDER BY __time DESC
      LIMIT ${itemsPerPage}
    `;
  } else {
    query = `
      SELECT * FROM (
        SELECT * FROM vessel_logs_vts ORDER BY __time DESC LIMIT ${itemsPerPage}
        UNION ALL
        SELECT * FROM vessel_logs_sat ORDER BY __time DESC LIMIT ${itemsPerPage}
      ) combined
      ORDER BY __time DESC
      LIMIT ${itemsPerPage}
    `;
  }
  
  console.log(query); // Log the query for debugging

  try {
    const response = await axios.post(DRUID_SQL_API, { query }, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data as VesselLog[];
  } catch (error) {
    console.error('Error fetching vessel logs from Druid:', error);
    return null; // Return null to indicate failure
  }
}

// Fetch the total number of pages for the logs
async function fetchTotalLogPages(mmsi: string, itemsPerPage: number) {
  let query = '';

  // If mmsi is provided, count logs by MMSI, otherwise count all logs
  if (mmsi && mmsi.trim() !== '') {
    const parsedMmsi = parseInt(mmsi, 10);
    query = `
      SELECT SUM(total_logs) AS total_logs FROM (
        SELECT COUNT(*) AS total_logs FROM vessel_logs_vts WHERE MMSI = ${parsedMmsi}
        UNION ALL
        SELECT COUNT(*) AS total_logs FROM vessel_logs_sat WHERE MMSI = ${parsedMmsi}
      ) combined
    `;
  } else {
    query = `
      SELECT SUM(total_logs) AS total_logs FROM (
        SELECT COUNT(*) AS total_logs FROM vessel_logs_vts
        UNION ALL
        SELECT COUNT(*) AS total_logs FROM vessel_logs_sat
      ) combined
    `;
  }

  console.log(query); // Log the query for debugging

  try {
    const response = await axios.post(DRUID_SQL_API, { query }, {
      headers: { 'Content-Type': 'application/json' },
    });
    const totalLogs = response.data[0]?.total_logs || 0;
    return Math.ceil(totalLogs / itemsPerPage);
  } catch (error) {
    console.error('Error fetching total pages from Druid:', error);
    return null;
  }
}

async function fetchLatestLogs() {
  const query = `
    SELECT l.* FROM (
      SELECT * FROM vessel_logs_vts
      UNION ALL
      SELECT * FROM vessel_logs_sat
    ) l
    INNER JOIN (
      SELECT MMSI, MAX(CAST(__time AS TIMESTAMP)) AS max_timestamp
      FROM (
        SELECT MMSI, __time FROM vessel_logs_vts
        UNION ALL
        SELECT MMSI, __time FROM vessel_logs_sat
      ) grouped
      GROUP BY MMSI
    ) latest
    ON l.MMSI = latest.MMSI AND l.__time = latest.max_timestamp
    WHERE l.__time >= CURRENT_TIMESTAMP - INTERVAL '2' HOUR
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
    return null; // Return null to indicate failure
  }
}

// Define a response structure to wrap data or error
interface ApiResponse<T> {
  data: T | null;  // Data or null if error
  error?: string;  // Error message if any
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mmsi = searchParams.get('mmsi') || ''; // Default to empty string if not provided
  const currentPage = parseInt(searchParams.get('currentPage') || '1', 10);
  const itemsPerPage = parseInt(searchParams.get('itemsPerPage') || '10', 10);
  const action = searchParams.get('action') || 'fetchLogs';

  let response: ApiResponse<any> = { data: null }; // Initialize response object
  let status = 200;

  try {
    if (action === 'fetchLogs') {
      const logs = await fetchVesselLogPage(mmsi, currentPage, itemsPerPage);
      response.data = logs;
    } else if (action === 'fetchTotalPages') {
      const totalPages = await fetchTotalLogPages(mmsi, itemsPerPage);
      response.data = totalPages;
    } else if (action === 'fetchLatestLogs') {
      const latestLogs = await fetchLatestLogs();
      response.data = latestLogs;
    } else {
      status = 400;
      response.error = 'Invalid action parameter';
    }
  } catch (error) {
    status = 500;
    response.error = 'Server error occurred';
  }

  return NextResponse.json(response, { status });
}

