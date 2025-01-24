'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/app/ui/shared/pagination';
import Search from '@/app/ui/shared/search';
import VesselsTable from '@/app/ui/vessels/table'; 
import { VesselTableSkeleton } from '@/app/ui/vessels/skeleton';
import { Suspense } from 'react';

import { fetchTotalVesselInfosPage } from '@/app/lib/cassandra/vessels'; // Function to fetch total pages for vessels

export default function Page(){
  const searchParams = useSearchParams();  // Use the hook to access search params

  const query = searchParams?.get('query') || ''; 
  const currentPage = Number(searchParams?.get('page')) || 1;

  const [totalPages, setTotalPages] = useState<number>(0); // State for total pages

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const pages = await fetchTotalVesselInfosPage(query); // Fetch total pages using the query
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
        <h1 className={`text-2xl`}>Vessels</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search with MMSI..." />
      </div>
      <Suspense key={query + currentPage} fallback={<VesselTableSkeleton />}>
        <VesselsTable query={query} currentPage={currentPage} /> {/* Render VesselsTable component */}
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
