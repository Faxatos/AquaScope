// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function LogsTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile View Skeleton */}
          <div className="md:hidden">
            <LogMobileSkeleton />
            <LogMobileSkeleton />
            <LogMobileSkeleton />
            <LogMobileSkeleton />
            <LogMobileSkeleton />
            <LogMobileSkeleton />
          </div>

          {/* Desktop Table Skeleton */}
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
              <LogTableRowSkeleton />
              <LogTableRowSkeleton />
              <LogTableRowSkeleton />
              <LogTableRowSkeleton />
              <LogTableRowSkeleton />
              <LogTableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function LogTableRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-100 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* MMSI */}
      <td className="relative overflow-hidden whitespace-nowrap py-3 pl-6 pr-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Zone */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-24 rounded bg-gray-100"></div>
      </td>
      {/* LOCODE */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-20 rounded bg-gray-100"></div>
      </td>
      {/* Latitude */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Longitude */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Speed */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Course */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* ETA */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-24 rounded bg-gray-100"></div>
      </td>
      {/* Timestamp */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-24 rounded bg-gray-100"></div>
      </td>
      {/* ECA */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-12 rounded bg-gray-100"></div>
      </td>
      {/* Source */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
        </div>
      </td>
    </tr>
  );
}

export function LogMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-8">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-gray-100"></div>
          <div className="h-6 w-24 rounded bg-gray-100"></div>
        </div>
        <div className="h-6 w-24 rounded bg-gray-100"></div>
      </div>
      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
          <div className="mt-2 h-6 w-24 rounded bg-gray-100"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-10 w-10 rounded bg-gray-100"></div>
          <div className="h-10 w-10 rounded bg-gray-100"></div>
        </div>
      </div>
    </div>
  );
}