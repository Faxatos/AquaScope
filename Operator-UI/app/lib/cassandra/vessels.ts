import { Vessel } from '@/app/lib/definitions'; // Shared type definition

// Fetch paginated vessel information from the API
export const fetchVesselInfosPage = async (mmsi: string, currentPage: number): Promise<Vessel[]> => {
  try {
    const response = await fetch(
      `/api/vessels?action=fetchLogs&mmsi=${mmsi}&currentPage=${currentPage}&itemsPerPage=10`
    );

    if (!response.ok) {
      console.error('Error fetching vessel info:', response.statusText);
      return [];
    }

    const data = await response.json();
    if (data.error) {
      console.error('API Error:', data.error);
      return [];
    }

    return data.data; // Directly return the data without normalization
  } catch (error) {
    console.error('Error fetching vessel info:', error);
    return [];
  }
};

// Fetch the total number of vessel info pages based on the query
export const fetchTotalVesselInfosPage = async (mmsi: string): Promise<number> => {
  try {
    const response = await fetch(`/api/vessels?action=fetchTotalPages&mmsi=${mmsi}`);
    const data = await response.json();

    if (data.error) {
      console.error('Error fetching total pages:', data.error);
      return 0; // Default to 0 pages if there's an error
    }

    return data.data || 0; // Return the total pages
  } catch (error) {
    console.error('Error fetching total pages:', error);
    return 0; // Default to 0 pages in case of network error
  }
};