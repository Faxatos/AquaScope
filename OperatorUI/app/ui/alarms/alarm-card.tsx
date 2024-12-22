import clsx from 'clsx';

export interface Alarm {
  id: string;
  timestamp: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export function AlarmCard({ alarm }: { alarm: Alarm }) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between rounded-lg p-4 shadow-sm',
        {
          'bg-red-100 border-red-500': alarm.severity === 'high',
          'bg-yellow-100 border-yellow-500': alarm.severity === 'medium',
          'bg-green-100 border-green-500': alarm.severity === 'low',
        },
      )}
    >
      <div>
        <p className="text-sm font-semibold">{alarm.message}</p>
        <p className="text-xs text-gray-500">
          {new Date(alarm.timestamp).toLocaleString()}
        </p>
      </div>
      <span
        className={clsx(
          'rounded-full px-3 py-1 text-xs font-semibold',
          {
            'bg-red-500 text-white': alarm.severity === 'high',
            'bg-yellow-500 text-white': alarm.severity === 'medium',
            'bg-green-500 text-white': alarm.severity === 'low',
          },
        )}
      >
        {alarm.severity.toUpperCase()}
      </span>
    </div>
  );
}
