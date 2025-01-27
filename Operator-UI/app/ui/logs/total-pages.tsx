import { useEffect, useState } from 'react';
import { fetchTotalPages } from '@/app/lib/druid/logs';
import Pagination from '@/app/ui/shared/pagination';

export default function TotalPages({ query }: { query: string }) {
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const regex = /^[0-9]+$/;

  // If the query is not empty, check if it's a valid number
  if (query !== "" && !regex.test(query)) {
    console.error('Invalid MMSI value:', query);
    return <div>Invalid MMSI value. Please enter a number.</div>;
  }

  // Function to fetch total pages every 5 seconds
  const fetchTotal = async () => {
    try {
      const total = await fetchTotalPages(query);
      setTotalPages(total);
      console.log('Fetched total pages:', total);
    } catch (error) {
      setError('Failed to fetch total pages');
      console.error('Error fetching total pages:', error);
    }
  };

  useEffect(() => {
    fetchTotal(); // Initial fetch
    const intervalIdTotal = setInterval(fetchTotal, 5000); // Fetch total pages every 5 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalIdTotal);
    };
  }, [query]);

  return (
    <div>
      {error ? <p>{error}</p> : totalPages !== null && <Pagination totalPages={totalPages} />}
    </div>
  );
}