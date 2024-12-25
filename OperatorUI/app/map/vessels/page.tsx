import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import VesselsTable from '@/app/ui/vessels/table'; // Assuming VesselsTable component
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';

import { fetchTotalVesselInfosPage } from '@/app/lib/data'; // Function to fetch total pages for vessels

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || ''; // MMSI search query (optional)
  const currentPage = Number(searchParams?.page) || 1; // Current page from query params
  const totalPages = await fetchTotalVesselInfosPage(query); // Fetch total pages for vessels

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`text-2xl`}>Vessels</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search with MMSI..." />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <VesselsTable query={query} currentPage={currentPage} /> {/* Render VesselsTable component */}
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}