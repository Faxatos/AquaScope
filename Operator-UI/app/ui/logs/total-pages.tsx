import { fetchTotalPages } from '@/app/lib/druid/logs';
import Pagination from '@/app/ui/shared/pagination';

export default async function TotalPages({ query }: { query: string }) {
  const regex = /^[0-9]+$/;

  // If the query is not empty, check if it's a valid number
  if (query !== "" && !regex.test(query)) {
    console.error('Invalid MMSI value:', query);
    return <div>Invalid MMSI value. Please enter a number.</div>;
  }

  try {
    const totalPages = await fetchTotalPages(query);
    console.log(totalPages)
    return <Pagination totalPages={totalPages} />;
  } catch (error) {
    console.error('Error fetching total pages:', error);
    return <div>Failed to fetch total pages.</div>;
  }
}