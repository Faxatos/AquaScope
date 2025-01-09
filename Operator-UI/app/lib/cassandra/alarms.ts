import { Client } from 'cassandra-driver';

// Initialize the Cassandra client
const client = new Client({
  contactPoints: ['cassandra.cassandra.svc.cluster.local:9042'], // Replace with your Cassandra host
  localDataCenter: 'datacenter1', // Replace with env value
  keyspace: 'vessel_management', // Replace with your keyspace
});

// Fetch a page of alarms
export async function fetchAlarmPage(
    mmsi: string,
    currentPage: number,
    itemsPerPage: number = 10
): Promise<any[]> {
    const offset = (currentPage - 1) * itemsPerPage;
    let query = 'SELECT * FROM alarms';
    const params: any[] = [];

    if (mmsi) {
        query += ' WHERE mmsi = ?';
        params.push(mmsi);
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(itemsPerPage, offset);

    const result = await client.execute(query, params, { prepare: true });
    return result.rows;
}

    // Fetch the total number of pages for alarms
export async function fetchTotalAlarmPages(
    mmsi: string,
    itemsPerPage: number = 10
): Promise<number> {
    let query = 'SELECT COUNT(*) FROM alarms';
    const params: any[] = [];

    if (mmsi) {
        query += ' WHERE mmsi = ?';
        params.push(mmsi);
    }

    const result = await client.execute(query, params, { prepare: true });
    const totalCount = result.rows[0]['count'];
    return Math.ceil(totalCount / itemsPerPage);
}