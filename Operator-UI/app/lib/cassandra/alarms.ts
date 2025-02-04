import { Alarm } from '@/app/lib/definitions'; // Shared type definition for Alarm

// Fetch paginated alarm information from the API
export const fetchAlarmPage = async (mmsi: string, currentPage: number): Promise<Alarm[]> => {
  try {
    // Remove the mmsi parameter from the URL if it's empty
    const url = mmsi 
      ? `/api/alarms?action=fetchAlarms&mmsi=${mmsi}&currentPage=${currentPage}&itemsPerPage=10`
      : `/api/alarms?action=fetchAlarms&currentPage=${currentPage}&itemsPerPage=10`; // No MMSI in the URL

    const response = await fetch(url);

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
    // Remove the mmsi parameter from the URL if it's empty
    const url = mmsi 
      ? `/api/alarms?action=fetchTotalPages&mmsi=${mmsi}`
      : `/api/alarms?action=fetchTotalPages`; // No MMSI in the URL
      
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Error fetching alarm data:', response.statusText);
      return 1;
    }

    const data = await response.json();

    if (data.error) {
      console.error('Error fetching total pages:', data.error);
      return 1; // Default to 1 pages if there's an error
    }

    return data.data || 1; // Return the total number of pages
  } catch (error) {
    console.error('Error fetching total pages:', error);
    return 1; // Default to 1 pages in case of network error
  }
};
