import axios from 'axios';
import { NextResponse } from 'next/server';
import { VesselLog } from '@/app/lib/definitions'; // Assuming your type definitions are in this file

const DRUID_SQL_API = 'http://druid-router.druid.svc.cluster.local:8888/druid/v2/sql';

async function fetchVesselLogPage(mmsi: string, currentPage: number, itemsPerPage: number) {
  const offset = (currentPage - 1) * itemsPerPage;
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
    return null; // Return null to indicate failure
  }
}

async function fetchTotalLogPages(mmsi: string, itemsPerPage: number) {
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
    return null; // Return null to indicate failure
  }
}

async function fetchLatestLogs() {
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
  const mmsi = searchParams.get('mmsi');
  const currentPage = parseInt(searchParams.get('currentPage') || '1', 10);
  const itemsPerPage = parseInt(searchParams.get('itemsPerPage') || '10', 10);
  const action = searchParams.get('action') || 'fetchLogs'; // Action can determine which function to run
  
  let response: ApiResponse<any> = { data: null }; // Initialize response object
  let status = 200;

  try {
    if (action === 'fetchLogs') {
      const logs = await fetchVesselLogPage(mmsi || '', currentPage, itemsPerPage);
      response.data = logs;
    } else if (action === 'fetchTotalPages') {
      const totalPages = await fetchTotalLogPages(mmsi || '', itemsPerPage);
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
