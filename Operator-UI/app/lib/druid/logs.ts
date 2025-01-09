import { VesselLog } from '@/app/lib/definitions'; // Shared type definition

// Fetch logs from the API
export const fetchPageLogs = async (mmsi: string, currentPage: number) => {
  try {
    const response = await fetch(
      `/api/logs?action=fetchLogs&mmsi=${mmsi}&currentPage=${currentPage}&itemsPerPage=10`
    );

    if (!response.ok) {
      console.error('Error fetching logs:', response.statusText);
      return [];
    }

    const data = await response.json();
    if (data.error) {
      console.error('API Error:', data.error);
      return [];
    }

    return data.data || []; // Return the logs array
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

// Fetch the total pages based on the query
export const fetchTotalPages = async (searchQuery: string): Promise<number> => {
  try {
    const response = await fetch(`/api/logs?action=fetchTotalPages&mmsi=${searchQuery}`);
    const data = await response.json();

    if (data.error) {
      console.error('Error fetching total pages:', data.error);
      return 0; // Default to 0 pages if there's an error
    }

    return data.totalPages || 0;
  } catch (error) {
    console.error('Error fetching total pages:', error);
    return 0; // Default to 0 pages in case of network error
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

    return data.data || [];
  } catch (error) {
    console.error('Error fetching vessel logs:', error);
    return null; // Return null in case of network error or other issues
  }
};