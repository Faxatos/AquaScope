import { formatDateToLocal } from '@/app/lib/utils';
import { ShowVesselDetails } from '@/app/ui/logs/buttons';
import { VesselLog } from '@/app/lib/definitions';

export function LogCardMobile({ log }: { log: VesselLog }) {
    return (
      <div key={log.timestamp} className="mb-2 w-full rounded-md bg-white p-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="mb-2 flex items-center">
              <p>Zone: {log.ZONE}</p>
            </div>
            <p className="text-sm text-gray-500">MMSI: {log.MMSI}</p>
            <p className="text-sm text-gray-500">LOCODE: {log.LOCODE}</p>
          </div>
          <p className="text-sm text-gray-500">
            ECA: {log.eca ? 'Yes' : 'No'}
          </p>
        </div>
        <div className="flex w-full items-center justify-between pt-4">
          <p className="text-sm font-medium">{formatDateToLocal(log.timestamp)}</p>
          <p className="text-sm text-gray-500">Source: {log.SRC}</p>
        </div>
      </div>
    );
  };
  
  // Desktop View Component
  export function LogCardDesktop ({ log }: { log: VesselLog }) {
    return (
      <tr key={log.timestamp} className="w-full border-b py-3 text-sm last-of-type:border-none">
        <td className="whitespace-nowrap py-3 pl-6 pr-3">{log.MMSI}</td>
        <td className="whitespace-nowrap px-3 py-3">{log.ZONE}</td>
        <td className="whitespace-nowrap px-3 py-3">{log.LOCODE}</td>
        <td className="whitespace-nowrap px-3 py-3">{log.latitude}</td>
        <td className="whitespace-nowrap px-3 py-3">{log.longitude}</td>
        <td className="whitespace-nowrap px-3 py-3">{log.SPEED}</td>
        <td className="whitespace-nowrap px-3 py-3">{log.COURSE}</td>
        <td className="whitespace-nowrap px-3 py-3">{formatDateToLocal(log.ETA_AIS)}</td>
        <td className="whitespace-nowrap px-3 py-3">{formatDateToLocal(log.timestamp)}</td>
        <td className="whitespace-nowrap px-3 py-3">{log.eca ? 'Yes' : 'No'}</td>
        <td className="whitespace-nowrap px-3 py-3">{log.SRC}</td>
        <td className="whitespace-nowrap py-3 pl-6 pr-3">
          <div className="flex justify-end gap-3">
            <ShowVesselDetails mmsi={log.MMSI} />
          </div>
        </td>
      </tr>
    );
  };