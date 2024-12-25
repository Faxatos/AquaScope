import { ShowVesselDetails } from '@/app/ui/logs/buttons';
import { formatDateToLocal } from '@/app/lib/utils';
import { fetchVesselLogPage } from '@/app/lib/data';

export default async function LogsTable({
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

  const logs = await fetchVesselLogPage(mmsi, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile View */}
          <div className="md:hidden">
            {logs?.map((log) => (
              <div key={log.timestamp} className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>Zone: {log.zone}</p>
                    </div>
                    <p className="text-sm text-gray-500">MMSI: {log.mmsi}</p>
                    <p className="text-sm text-gray-500">LOCODE: {log.locode}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    ECA: {log.eca ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <p className="text-sm font-medium">
                    {formatDateToLocal(log.timestamp)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Source: {log.src}
                  </p>
                </div>
              </div>
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
              {logs?.map((log) => (
                <tr key={log.timestamp} className="w-full border-b py-3 text-sm last-of-type:border-none">
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">{log.mmsi}</td>
                  <td className="whitespace-nowrap px-3 py-3">{log.zone}</td>
                  <td className="whitespace-nowrap px-3 py-3">{log.locode}</td>
                  <td className="whitespace-nowrap px-3 py-3">{log.latitude}</td>
                  <td className="whitespace-nowrap px-3 py-3">{log.longitude}</td>
                  <td className="whitespace-nowrap px-3 py-3">{log.speed}</td>
                  <td className="whitespace-nowrap px-3 py-3">{log.course}</td>
                  <td className="whitespace-nowrap px-3 py-3">{log.eta_ais}</td>
                  <td className="whitespace-nowrap px-3 py-3">{formatDateToLocal(log.timestamp)}</td>
                  <td className="whitespace-nowrap px-3 py-3">{log.eca ? 'Yes' : 'No'}</td>
                  <td className="whitespace-nowrap px-3 py-3">{log.src}</td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                    <ShowVesselDetails mmsi={log.mmsi} />
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
