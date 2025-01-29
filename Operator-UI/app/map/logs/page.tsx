'use client';

import { useSearchParams } from 'next/navigation';
import Search from '@/app/ui/shared/search';
import LogsTable from '@/app/ui/logs/table';
import { LogsTableSkeleton } from '@/app/ui/logs/skeleton';
import { Suspense } from 'react';
import TotalPages from '@/app/ui/logs/total-pages';

export default function Page() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('query') || '';
  const currentPage = Number(searchParams?.get('page')) || 1;
  console.log("i'm in logs/page.tsx")

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Logs</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search with MMSI..." />
      </div>
      <Suspense key={query + currentPage} fallback={<LogsTableSkeleton />}>
        <LogsTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
      <Suspense fallback={<div>Number of pages are loading...</div>}>
        <TotalPages query={query} />
      </Suspense>
      </div>
    </div>
  );
}
