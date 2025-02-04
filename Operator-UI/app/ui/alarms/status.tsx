import clsx from 'clsx';

interface AlarmStatusProps {
  status: 'active' | 'resolved'; // Alarm status can be 'active' or 'resolved'
}

export default function AlarmStatus({ status }: AlarmStatusProps) {
  const safeStatus = status ?? 'active'; // Default to 'active' if undefined

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold',
        {
          'bg-red-500 text-white': safeStatus === 'active',  // Active status: Red background
          'bg-green-500 text-white': safeStatus === 'resolved', // Resolved status: Green background
        }
      )}
    >
      {safeStatus.toUpperCase()} {/* Display the status (ACTIVE or RESOLVED) */}
    </span>
  );
}
