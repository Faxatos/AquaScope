import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import LogsTable from '@/app/ui/logs/table';
import { LogsTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';

import { fetchTotalLogPages } from '@/app/lib/data';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchTotalLogPages(query); // Function to fetch the total pages for logs

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

