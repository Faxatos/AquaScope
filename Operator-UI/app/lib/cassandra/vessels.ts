import { Vessel } from '@/app/lib/definitions'; // Shared type definition

// Fetch paginated vessel information from the API
export const fetchVesselInfosPage = async (mmsi: string, currentPage: number): Promise<Vessel[]> => {
  try {
    const baseUrl = '/api/vessels?action=fetchVessels&currentPage=' + currentPage + '&itemsPerPage=10';
    const url = mmsi ? baseUrl + `&mmsi=${mmsi}` : baseUrl;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Error fetching vessel info:', response.statusText);
      return [];
    }

    const data = await response.json();
    if (data.error) {
      console.error('API Error:', data.error);
      return [];
    }

    return data.data || []; // Directly return the data without normalization
  } catch (error) {
    console.error('Error fetching vessel info:', error);
    return [];
  }
};

// Fetch the total number of vessel info pages based on the query
export const fetchTotalVesselInfosPage = async (mmsi: string): Promise<number> => {
  try {
    const baseUrl = '/api/vessels?action=fetchTotalPages';
    const url = mmsi ? baseUrl + `&mmsi=${mmsi}` : baseUrl;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Error fetching vessel page count (Status: ${response.status}):`, response.statusText);
      return 1;
    }

    const data = await response.json();
    if (data.error) {
      console.error('Error fetching total vessel pages:', data.error);
      return 1;
    }

    return data.data || 1;
  } catch (error) {
    console.error('Error fetching total pages:', error);
    return 1; // Default to 0 pages in case of network error
  }
};