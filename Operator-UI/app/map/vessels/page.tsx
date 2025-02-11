'use client';

import { useSearchParams } from 'next/navigation';
import Search from '@/app/ui/shared/search';
import VesselsTable from '@/app/ui/vessels/table';
import { Suspense } from 'react';
import TotalPages from '@/app/ui/vessels/total-pages';

export default function Page(){
  const searchParams = useSearchParams();  // Use the hook to access search params
  const query = searchParams?.get('query') || ''; 
  const currentPage = Number(searchParams?.get('page')) || 1;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Vessels</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search with MMSI..." />
      </div>
      <VesselsTable query={query} currentPage={currentPage} />
      <div className="mt-5 flex w-full justify-center">
        <Suspense key={query + currentPage} fallback={<div>Loading number of pages...</div>}>
          <TotalPages query={query} />
        </Suspense>
      </div>
    </div>
  );
}
