import { GlobeAltIcon } from '@heroicons/react/24/outline';

export default function AquaScopeLogo() {
  return (
    <div
      className={` flex flex-col items-center leading-none text-white`}
    >
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[44px]">Aqua</p>
      <p className="text-[44px]">Scope</p>
    </div>
  );
}
