import { NextResponse } from 'next/server';
import { Client } from 'cassandra-driver';

// Initialize the Cassandra client
const client = new Client({
  contactPoints: ['http://cassandra.cassandra.svc.cluster.local:9042'], //Cassandra host
  localDataCenter: 'datacenter1', //Cassandra datacenter
  keyspace: 'vessel_management', //keyspace
  credentials: { 
    username: 'cassandra', 
    password: 'cassandra' 
  }, 
});

// Attach event listeners for logging
client.on('log', (level, className, message) => {
  console.log(`[CASSANDRA ${level}] ${className}: ${message}`);
})

async function fetchAlarmPage(mmsi: string, currentPage: number, itemsPerPage: number) {
  const fetchLimit = currentPage * itemsPerPage; // Fetch more than needed
  let query = '';
  const params: any[] = [];

  if (mmsi && mmsi.trim() !== '') {
    const parsedMmsi = parseInt(mmsi, 10);
    query = `SELECT * FROM alarm WHERE mmsi = ? ORDER BY timestamp DESC LIMIT ? ALLOW FILTERING`;
    params.push(parsedMmsi, fetchLimit);
  } else {
    query = `SELECT * FROM alarm ORDER BY timestamp DESC LIMIT ? ALLOW FILTERING`;
    params.push(fetchLimit);
  }

  try {
    console.log(`Executing query: ${query} with params: ${params}`);
    const result = await client.execute(query, params, { prepare: true });
    console.log("result: " + JSON.stringify(result, null, 2))
    
    // Manually slice results to get only the correct page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return result.rows.slice(startIndex, endIndex);
  } catch (error) {
    console.error('Error fetching alarm data from Cassandra:', error);
    return [];
  }
}


// Fetch the total number of alarm pages
async function fetchTotalAlarmPages(mmsi: string, itemsPerPage: number): Promise<number> {
  let query = 'SELECT COUNT(*) FROM alarm';
  const params: any[] = [];

  if (mmsi && mmsi.trim() !== '') {
    query += ' WHERE mmsi = ? ALLOW FILTERING';
    params.push(parseInt(mmsi, 10)); // Ensure MMSI is an integer
  }

  try {
    console.log(`Executing query: ${query} with params: ${params}`);
    const result = await client.execute(query, params, { prepare: true });

    // Extract the total count from Cassandra response
    const totalCount = Number(result.rows[0]['count']);
    return Math.ceil(totalCount / itemsPerPage);
  } catch (error) {
    console.error('Error fetching total alarm pages from Cassandra:', error);
    return 1;
  }
}

// Define a response structure
interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

// Handle API requests
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  console.log("url: " + req.url)
  const mmsi = searchParams.get('mmsi') || '';
  const currentPage = parseInt(searchParams.get('currentPage') || '1', 10);
  const itemsPerPage = parseInt(searchParams.get('itemsPerPage') || '10', 10);
  const action = searchParams.get('action') || 'fetchAlarms';

  let response: ApiResponse<any> = { data: null };
  let status = 200;

  try {
    if (action === 'fetchAlarms') {
      const alarms = await fetchAlarmPage(mmsi, currentPage, itemsPerPage);
      response.data = alarms;
    } else if (action === 'fetchTotalPages') {
      const totalPages = await fetchTotalAlarmPages(mmsi, itemsPerPage);
      response.data = totalPages;
    } else {
      status = 400;
      response.error = 'Invalid action parameter';
    }
  } catch (error) {
    status = 500;
    response.error = 'Server error occurred';
    console.error('Error processing request:', error);
  }

  return NextResponse.json(response, { status });
}
