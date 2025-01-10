'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/app/ui/shared/pagination';
import Search from '@/app/ui/shared/search';
import LogsTable from '@/app/ui/logs/table';
import { LogsTableSkeleton } from '@/app/ui/logs/skeleton';
import { Suspense } from 'react';

import { fetchTotalPages } from '@/app/lib/druid/logs';

export default function Page(){
  const searchParams = useSearchParams();  // Use the hook to access search params

  const query = searchParams?.get('query') || ''; 
  const currentPage = Number(searchParams?.get('page')) || 1;

  const [totalPages, setTotalPages] = useState<number>(0); // State for total pages

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const pages = await fetchTotalPages(query); // Fetch total pages using the query
        setTotalPages(pages);
      } catch (error) {
        console.error('Failed to fetch total pages:', error);
        setTotalPages(0); // Fallback in case of error
      }
    };

    fetchPages();
  }, [query]); // Re-run when query changes

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
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}

