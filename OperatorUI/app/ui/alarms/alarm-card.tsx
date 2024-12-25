import { SolveAlarm } from '@/app/ui/alarms/buttons';
import AlarmStatus from '@/app/ui/alarms/status';
import { formatDateToLocal } from '@/app/lib/utils';
import { Alarm } from '@/app/lib/definitions';

export function AlarmCardMobile({ alarm }: { alarm: Alarm }) {
  return (
    <div
      key={alarm.alarm_id}
      className="mb-2 w-full rounded-md bg-white p-4"
    >
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="mb-2 flex items-center">
            <p>{alarm.description}</p>
          </div>
          <p className="text-sm text-gray-500">{alarm.code}</p>
          <p className="text-sm text-gray-500">MMSI: {alarm.mmsi}</p>
        </div>
        <AlarmStatus status={alarm.status as 'active' | 'resolved'} />
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
  );
}

export function AlarmCardDesktop({ alarm }: { alarm: Alarm }) {
  return (
    <tr
      key={alarm.alarm_id}
      className="w-full border-b py-3 text-sm last-of-type:border-none"
    >
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
        <AlarmStatus status={alarm.status as 'active' | 'resolved'} />
      </td>
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <SolveAlarm id={alarm.alarm_id} />
        </div>
      </td>
    </tr>
  );
}
