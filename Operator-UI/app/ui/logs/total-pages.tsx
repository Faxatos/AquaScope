import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { fetchTotalPages } from '@/app/lib/druid/logs';
import Pagination from '@/app/ui/shared/pagination';

export default function TotalPages({ query }: { query: string }) {
  const regex = /^[0-9]+$/;

  // Validate query
  if (query !== "" && !regex.test(query)) {
    console.error('Invalid MMSI value:', query);
    return <div>Invalid MMSI value. Please enter a number.</div>;
  }

  // Wrapping the async fetch inside Suspense
  const fetchData = async () => {
    try {
      const totalPages = await fetchTotalPages(query);
      console.log(totalPages)
      return totalPages;
    } catch (error) {
      console.error('Error fetching total pages:', error);
      throw new Error('Failed to fetch total pages');
    }
  };

  return (
    <Suspense fallback={<div>Loading total pages...</div>}>
      <AsyncPagination fetchData={fetchData} />
    </Suspense>
  );
}

function AsyncPagination({ fetchData }: { fetchData: () => Promise<number> }) {
  const [totalPages, setTotalPages] = useState<number | null>(null);
  
  useEffect(() => {
    fetchData().then(setTotalPages).catch((err) => console.error(err));
  }, [fetchData]);

  if (totalPages === null) return null;  // Don't render anything if still loading

  return <Pagination totalPages={totalPages} />;
}
