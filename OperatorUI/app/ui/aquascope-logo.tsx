import { GlobeAltIcon } from '@heroicons/react/24/outline';

export default function AquaScopeLogo() {
  return (
    <div
      className={`flex flex-row items-center leading-none text-white sm:justify-center sm:space-x-2`}
    >
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
      <div className="text-center sm:text-left">
        <p className="text-[30px] md:text-[44px]">Aqua</p>
        <p className="text-[30px] md:text-[44px]">Scope</p>
      </div>
    </div>
  );
}
