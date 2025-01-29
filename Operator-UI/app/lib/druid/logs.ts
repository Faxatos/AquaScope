import { VesselLog } from '@/app/lib/definitions'; // Shared type definition

// Fetch logs from the API
export const fetchPageLogs = async (mmsi: string, currentPage: number) => {
  try {
    // Remove the mmsi parameter from the URL if it's empty
    const url = mmsi 
      ? `/api/logs?action=fetchLogs&mmsi=${mmsi}&currentPage=${currentPage}&itemsPerPage=10`
      : `/api/logs?action=fetchLogs&currentPage=${currentPage}&itemsPerPage=10`; // No MMSI in the URL

    console.log("mmsi1:" + mmsi);
    console.log(url)
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Error fetching logs:', response.statusText);
      return [];
    }

    const data = await response.json();
    if (data.error) {
      console.error('API Error:', data.error);
      return [];
    }

    // Normalize the data
    const normalizedData = data.data.map((log: any) => ({
      ...log,
      latitude: parseFloat(log.LATITUDE),
      longitude: parseFloat(log.LONGITUDE),
      eca: log.ECA === 'true',
      timestamp: log.__time,
    }));

    return normalizedData;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

// Fetch the total pages based on the query
export const fetchTotalPages = async (searchQuery: string): Promise<number> => {
  try {
    // Remove the mmsi parameter from the URL if it's empty
    const url = searchQuery
      ? `/api/logs?action=fetchTotalPages&mmsi=${searchQuery}`
      : `/api/logs?action=fetchTotalPages`;

    console.log("mmsi2:" + searchQuery);
    console.log(url)

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Error fetching logs:', response.statusText);
      return 1;
    }

    console.log("Response: " + JSON.stringify(response, null, 2));

    const data = await response.json();

    console.log("Response: " + JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('Error fetching total pages:', data.error);
      return 1; // Default to 1 page if there's an error
    }

    console.log("total pages:" + data.totalPages)

    return data.totalPages || 1;
  } catch (error) {
    console.error('Error fetching total pages:', error);
    return 1; // Default to 1 pages in case of network error
  }
};

// Function to fetch the latest vessel logs from the API
export const fetchLatestLogs = async (): Promise<VesselLog[] | null> => {
  try {
    const response = await fetch('/api/logs?action=fetchLatestLogs'); // Adjust the endpoint if necessary
    const data = await response.json();

    if (data.error) {
      console.error('Error:', data.error);
      return null; // Return null if there's an error
    }

    // Map the data to ensure that latitudes and longitudes are numbers and booleans are correctly handled
    const normalizedData = data.data.map((log: any) => ({
      ...log,
      latitude: parseFloat(log.LATITUDE),  // Convert LATITUDE to latitude (float)
      longitude: parseFloat(log.LONGITUDE), // Convert LONGITUDE to longitude (float)
      eca: log.ECA === 'true',  // Normalize ECA as a boolean (true or false)
      timestamp: log.__time,  // Keep timestamp for use in popup
    }));

    // Return the normalized data
    return normalizedData;
  } catch (error) {
    console.error('Error fetching vessel logs:', error);
    return null; // Return null in case of network error or other issues
  }
};
