import { SolveAlarm } from '@/app/ui/alarms/buttons';
import AlarmStatus from '@/app/ui/alarms/status';
import { formatDateToLocal } from '@/app/lib/utils';
import { fetchAlarmPage } from '@/app/lib/data';

export default async function InvoicesTable({
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

// If the query is valid, assign it directly (as a string) or use an empty string
const mmsi = query === "" ? "" : query;

const alarms = await fetchAlarmPage(mmsi, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile View */}
          <div className="md:hidden">
            {alarms?.map((alarm) => (
              <div key={alarm.alarm_id} className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{alarm.description}</p>
                    </div>
                    <p className="text-sm text-gray-500">{alarm.code}</p>
                    <p className="text-sm text-gray-500">MMSI: {alarm.mmsi}</p>
                  </div>
                  <AlarmStatus status={alarm.status as "active" | "resolved"} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <p className="text-sm font-medium">
                    {formatDateToLocal(alarm.timestamp)}
                  </p>
                  <div className="flex justify-end gap-2">
                    <SolveAlarm id={alarm.alarm_id} />
                  </div>
                </div>
              </div>
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
                <tr key={alarm.alarm_id} className="w-full border-b py-3 text-sm last-of-type:border-none">
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{alarm.code}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{alarm.description}</td>
                  <td className="whitespace-nowrap px-3 py-3">{alarm.mmsi}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(alarm.timestamp)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <AlarmStatus status={alarm.status as "active" | "resolved"} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <SolveAlarm id={alarm.alarm_id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

