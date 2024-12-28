import clsx from 'clsx';

interface AlarmStatusProps {
  status: 'active' | 'resolved'; // Alarm status can be 'active' or 'resolved'
}

export default function AlarmStatus({ status }: AlarmStatusProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold',
        {
          'bg-red-500 text-white': status === 'active',  // Active status: Red background
          'bg-green-500 text-white': status === 'resolved', // Resolved status: Green background
        }
      )}
    >
      {status.toUpperCase()} {/* Display the status (ACTIVE or RESOLVED) */}
    </span>
  );
}
