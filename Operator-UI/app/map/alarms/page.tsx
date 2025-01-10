'use client';

import { useState, useEffect } from 'react';
import Pagination from '@/app/ui/shared/pagination';
import Search from '@/app/ui/shared/search';
import Table from '@/app/ui/alarms/table';
import { AlarmsTableSkeleton } from '@/app/ui/alarms/skeleton';
import { Suspense } from 'react';

import { fetchTotalAlarmPages } from '@/app/lib/cassandra/alarms'; 

export default function Page({
  searchParams,
}: {
  searchParams?: { query?: string; page?: string };
}) {
  const query = searchParams?.query || ''; // Safely destructure
  const currentPage = Number(searchParams?.page) || 1;

  const [totalPages, setTotalPages] = useState<number>(0); // State for total pages

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const pages = await fetchTotalAlarmPages(query); // Fetch total pages using the query
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
        <h1 className={`text-2xl`}>Alarms</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search with MMSI..." />
      </div>
      <Suspense key={query + currentPage} fallback={<AlarmsTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
