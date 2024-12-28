import { VesselCardMobile, VesselCardDesktop } from '@/app/ui/vessels/vessel-card';
import { fetchVesselInfosPage } from '@/app/lib/data'; // Assuming a function to fetch vessel data page

export default async function VesselTable({
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

  const vessels = await fetchVesselInfosPage(mmsi, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile View */}
          <div className="md:hidden">
            {vessels?.map((vessel) => (
              <VesselCardMobile key={vessel.mmsi} vessel={vessel} />
            ))}
          </div>

          {/* Desktop Table View */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">MMSI</th>
                <th className="px-3 py-5 font-medium">Callsign</th>
                <th className="px-3 py-5 font-medium">IMO</th>
                <th className="px-3 py-5 font-medium">Draught (m)</th>
                <th className="px-3 py-5 font-medium">Dimensions (A x B x C x D)</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {vessels?.map((vessel) => (
                <VesselCardDesktop key={vessel.mmsi} vessel={vessel} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}