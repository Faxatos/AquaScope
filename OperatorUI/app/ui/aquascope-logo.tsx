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

export function AquaScopeLogoHome() {
  return (
    <div
      className="flex flex-row items-center leading-none text-white space-x-8 md:space-x-10 scale-[1.5] md:scale-[2]"
    >
      <GlobeAltIcon className="h-20 w-20 rotate-[15deg] md:h-32 md:w-32" />
      <div className="text-center sm:text-left">
        <p className="text-[48px] md:text-[64px] leading-none">Aqua</p>
        <p className="text-[48px] md:text-[64px] leading-none">Scope</p>
      </div>
    </div>
  );
}
