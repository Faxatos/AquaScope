import { Alarm } from '@/app/lib/definitions'; // Shared type definition for Alarm

// Fetch paginated alarm information from the API
export const fetchAlarmPage = async (mmsi: string, currentPage: number): Promise<Alarm[]> => {
  try {
    const response = await fetch(
      `/api/alarms?action=fetchLogs&mmsi=${mmsi}&currentPage=${currentPage}&itemsPerPage=10`
    );

    if (!response.ok) {
      console.error('Error fetching alarm data:', response.statusText);
      return [];
    }

    const data = await response.json();
    if (data.error) {
      console.error('API Error:', data.error);
      return [];
    }

    return data.data; // Return the data directly without normalization
  } catch (error) {
    console.error('Error fetching alarm data:', error);
    return [];
  }
};

// Fetch the total number of alarm pages based on the query
export const fetchTotalAlarmPages = async (mmsi: string): Promise<number> => {
  try {
    const response = await fetch(`/api/alarms?action=fetchTotalPages&mmsi=${mmsi}`);
    const data = await response.json();

    if (data.error) {
      console.error('Error fetching total pages:', data.error);
      return 0; // Default to 0 pages if there's an error
    }

    return data.data || 0; // Return the total number of pages
  } catch (error) {
    console.error('Error fetching total pages:', error);
    return 0; // Default to 0 pages in case of network error
  }
};
