'use client';

import { fetchTotalPages } from '@/app/lib/druid/logs';

import { useSuspenseQuery } from "@tanstack/react-query";
import { generatePagination } from '@/app/lib/utils';
import { usePathname, useSearchParams } from 'next/navigation';
import { PaginationArrow, PaginationNumber } from '@/app/ui/shared/pagination';

export default function TotalPages({ query }: { query: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const regex = /^[0-9]+$/;
  console.log("i'm in ui/logs/total-pages.tsx")

  // Validate query
  if (query !== "" && !regex.test(query)) {
    console.error('Invalid MMSI value:', query);
    return <div>Invalid MMSI value. Please enter a number.</div>;
  }

  const { data: totalPages } = useSuspenseQuery({
    queryKey: ["totalLogsPages", query],
    queryFn: () => fetchTotalPages(query),
    refetchInterval: 5000, // Auto-refresh logs every 5 seconds
    keepPreviousData: true,
    placeholderData: undefined,
    staleTime: 4000,
  });

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <>
    <div className="inline-flex">
        <PaginationArrow
          direction="left"
          href={createPageURL(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />

        <div className="flex -space-x-px">
          {allPages.map((page, index) => {
            let position: 'first' | 'last' | 'single' | 'middle' | undefined;

            if (index === 0) position = 'first';
            if (index === allPages.length - 1) position = 'last';
            if (allPages.length === 1) position = 'single';
            if (page === '...') position = 'middle';

            return (
              <PaginationNumber
                key={page}
                href={createPageURL(page)}
                page={page}
                position={position}
                isActive={currentPage === page}
              />
            );
          })}
        </div>

        <PaginationArrow
          direction="right"
          href={createPageURL(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        />
      </div>
    </>
  );
}