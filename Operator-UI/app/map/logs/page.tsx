'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Search from '@/app/ui/shared/search';
import LogsTable from '@/app/ui/logs/table';
import { LogsTableSkeleton } from '@/app/ui/logs/skeleton';
import Pagination from '@/app/ui/shared/pagination';
import { Suspense } from 'react';

import { fetchTotalPages } from '@/app/lib/druid/logs';

export default function Page(){
  const searchParams = useSearchParams();  // Use the hook to access search params

  const query = searchParams?.get('query') || ''; 
  const currentPage = Number(searchParams?.get('page')) || 1;

  const [totalPages, setTotalPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const regex = /^[0-9]+$/;

  // Fetch total pages every 5 seconds
  useEffect(() => {
    if (query !== "" && !regex.test(query)) {
      setError("Invalid MMSI value. Please enter a number.");
      return;
    }

    const fetchPages = async () => {
      try {
        const pages = await fetchTotalPages(query);
        setTotalPages(pages);
        setError(null);
      } catch (error) {
        console.error("Error fetching total pages:", error);
        setError("Failed to fetch total pages.");
      }
    };

    fetchPages(); // Initial fetch
    const intervalId = setInterval(fetchPages, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [query]);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`text-2xl`}>Logs</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search with MMSI..." />
      </div>
      <Suspense key={query + currentPage} fallback={<LogsTableSkeleton />}>
        <LogsTable query={query} currentPage={currentPage} /> {/* Render LogsTable component */}
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        {error ? <p>{error}</p> : <Pagination totalPages={totalPages} />}
      </div>
    </div>
  );
}

