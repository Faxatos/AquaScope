'use client';

import { useQuery } from "@tanstack/react-query";
import { fetchPageLogs } from '@/app/lib/druid/logs';
import { VesselLog } from '@/app/lib/definitions';
import { LogCardDesktop, LogCardMobile } from '@/app/ui/logs/log-card'
import { LogsTableSkeleton } from '@/app/ui/logs/skeleton';

export default function LogsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  // Regex to check if the query is a valid number (positive integers)
  const regex = /^[0-9]+$/;

  // If the query is not empty, check if it's a valid number
  if (query !== "" && !regex.test(query)) {
    // Handle the case where the query is not a valid number
    console.error('Invalid MMSI value:', query);
    return <div>Invalid MMSI value. Please enter a number.</div>;
  }

  const { data: logs, isLoading } = useQuery({
    queryKey: ["logs", query, currentPage],
    queryFn: () => fetchPageLogs(query, currentPage),
    refetchInterval: 5000, // Auto-refresh logs every 5 seconds
    keepPreviousData: true, // Keeps old data visible while fetching
    staleTime: 4000, // Helps reduce refetch frequency
  });

  // Show skeleton only on first load, not on refetch
  if (isLoading && !logs) return <LogsTableSkeleton />;

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile View */}
          <div className="md:hidden">
            {logs?.map((log: VesselLog) => (
              <LogCardMobile key={`${log.timestamp}-${log.MMSI}`} log={log} />
            ))}
          </div>

          {/* Desktop Table View */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">MMSI</th>
                <th className="px-3 py-5 font-medium">Zone</th>
                <th className="px-3 py-5 font-medium">LOCODE</th>
                <th className="px-3 py-5 font-medium">Latitude</th>
                <th className="px-3 py-5 font-medium">Longitude</th>
                <th className="px-3 py-5 font-medium">Speed (knots)</th>
                <th className="px-3 py-5 font-medium">Course (°)</th>
                <th className="px-3 py-5 font-medium">ETA (AIS)</th>
                <th className="px-3 py-5 font-medium">Timestamp</th>
                <th className="px-3 py-5 font-medium">ECA</th>
                <th className="px-3 py-5 font-medium">Source</th>
                <th className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {logs?.map((log: VesselLog) => (
                <LogCardDesktop key={`${log.timestamp}-${log.MMSI}`} log={log} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
