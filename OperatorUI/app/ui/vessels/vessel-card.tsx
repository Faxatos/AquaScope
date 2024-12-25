import { Vessel } from '@/app/lib/definitions';

export function VesselCardMobile({ vessel }: { vessel: Vessel }) {
    return (
      <div key={vessel.mmsi} className="mb-2 w-full rounded-md bg-white p-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="mb-2 flex items-center">
              <p>Callsign: {vessel.callsign}</p>
            </div>
            <p className="text-sm text-gray-500">MMSI: {vessel.mmsi}</p>
            <p className="text-sm text-gray-500">IMO: {vessel.imo}</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-between pt-4">
          <p className="text-sm font-medium">Draught: {vessel.draught} meters</p>
          <p className="text-sm text-gray-500">Dimensions: {vessel.a}x{vessel.b}x{vessel.c}x{vessel.d}</p>
        </div>
      </div>
    );
  }
  
  export function VesselCardDesktop({ vessel }: { vessel: Vessel }) {
    return (
      <tr key={vessel.mmsi} className="w-full border-b py-3 text-sm last-of-type:border-none">
        <td className="whitespace-nowrap py-3 pl-6 pr-3">{vessel.mmsi}</td>
        <td className="whitespace-nowrap px-3 py-3">{vessel.callsign}</td>
        <td className="whitespace-nowrap px-3 py-3">{vessel.imo}</td>
        <td className="whitespace-nowrap px-3 py-3">{vessel.draught}</td>
        <td className="whitespace-nowrap px-3 py-3">
          {vessel.a} x {vessel.b} x {vessel.c} x {vessel.d}
        </td>
      </tr>
    );
  }