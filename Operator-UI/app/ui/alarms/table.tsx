import { useQuery } from "@tanstack/react-query";
import { AlarmsTableSkeleton } from '@/app/ui/alarms/skeleton';
import { AlarmCardMobile, AlarmCardDesktop } from '@/app/ui/alarms/alarm-card';
import { fetchAlarmPage } from '@/app/lib/cassandra/alarms';

export default function AlarmsTable({
  query,
  currentPage,
  }: {
    query: string;
    currentPage: number;
  }) {

  const regex = /^[0-9]+$/;

  if (query !== "" && !regex.test(query)) {
    console.error('Invalid MMSI value:', query);
    return <div>Invalid MMSI value. Please enter a number.</div>;
  }

  const mmsi = query === "" ? "" : query;
  
  const { data: alarms, isLoading } = useQuery({
    queryKey: ["alarms", query, currentPage], // Unique key for alarms
    queryFn: () => fetchAlarmPage(query, currentPage),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    keepPreviousData: true, // Keeps old data while fetching new data
    staleTime: 4000, // Prevents excessive refetching
  });
  
  // Show skeleton only on first load, not on refetch
  if (isLoading && !alarms) return <AlarmsTableSkeleton />;

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile View */}
          <div className="md:hidden">
            {alarms?.map((alarm) => (
              <AlarmCardMobile key={`${alarm.alarm_id}-${alarm.mmsi}`} alarm={{ ...alarm, status: alarm.status as 'active' | 'resolved' }} />
            ))}
          </div>

          {/* Desktop Table View */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Alarm Code</th>
                <th className="px-3 py-5 font-medium">Description</th>
                <th className="px-3 py-5 font-medium">MMSI</th>
                <th className="px-3 py-5 font-medium">Timestamp</th>
                <th className="px-3 py-5 font-medium">Status</th>
                <th className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {alarms?.map((alarm) => (
                <AlarmCardDesktop key={alarm.alarm_id} alarm={{ ...alarm, status: alarm.status as 'active' | 'resolved' }} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

