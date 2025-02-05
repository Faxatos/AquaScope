import { NextResponse } from 'next/server';
import { Client } from 'cassandra-driver';

// Initialize the Cassandra client
const client = new Client({
  contactPoints: ['cassandra.cassandra.svc.cluster.local:9042'], //Cassandra host
  localDataCenter: 'datacenter1', //Cassandra datacenter
  keyspace: 'vessel_management', //Keyspace
  credentials: { 
    username: 'cassandra', 
    password: 'cassandra' 
  },
});

// Attach event listeners for logging
client.on('log', (level, className, message) => {
  console.log(`[CASSANDRA ${level}] ${className}: ${message}`);
});

// Fetch paginated vessel data
async function fetchVesselInfosPage(
  mmsi: string,
  currentPage: number,
  itemsPerPage: number
): Promise<any[]> {
  const fetchLimit = currentPage * itemsPerPage; // Fetch more than needed
  let query = 'SELECT * FROM vessel';
  const params: any[] = [];

  if (mmsi) {
    query += ' WHERE mmsi = ?';
    params.push(parseInt(mmsi, 10));
  }

  query += ' LIMIT ?';
  params.push(fetchLimit);

  try {
    const result = await client.execute(query, params, { prepare: true });

    // **Manually slice results to get only the correct page**
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return result.rows.slice(startIndex, endIndex);
  } catch (error) {
    console.error('Error fetching vessel info from Cassandra:', error);
    return [];
  }
}

// Fetch total number of vessel pages
async function fetchTotalVesselInfosPage(
  mmsi: string,
  itemsPerPage: number
): Promise<number> {
  let query = 'SELECT COUNT(*) FROM vessels';
  const params: any[] = [];

  if (mmsi) {
    query += ' WHERE mmsi = ?';
    params.push(parseInt(mmsi, 10));
  }

  try {
    const result = await client.execute(query, params, { prepare: true });

    // Extract the total count from Cassandra response
    const totalCount = Number(result.rows[0]['count']);
    return Math.ceil(totalCount / itemsPerPage);
  } catch (error) {
    console.error('Error fetching total vessel info pages from Cassandra:', error);
    return 0;
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
  const mmsi = searchParams.get('mmsi') || '';
  const currentPage = parseInt(searchParams.get('currentPage') || '1', 10);
  const itemsPerPage = parseInt(searchParams.get('itemsPerPage') || '10', 10);
  const action = searchParams.get('action') || 'fetchVessels';

  let response: ApiResponse<any> = { data: null };
  let status = 200;

  try {
    if (action === 'fetchVessels') {
      const vessels = await fetchVesselInfosPage(mmsi, currentPage, itemsPerPage);
      response.data = vessels;
    } else if (action === 'fetchTotalPages') {
      const totalPages = await fetchTotalVesselInfosPage(mmsi, itemsPerPage);
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
