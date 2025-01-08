import AquaScopeLogoHome from '@/app/ui/shared/aquascope-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex min-h-[5rem] md:min-h-[10rem] items-center justify-center rounded-lg bg-blue-500 p-4">
        <AquaScopeLogoHome />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <p className={`text-xl text-gray-800 md:text-3xl md:leading-normal`}>
            <strong>Real-time distributed platform</strong> for analyzing maritime traffic data from multiple sources.
          </p>
          <p className="text-gray-600">
            This project enhances anomaly detection and decision-making for maritime operators by processing and analyzing AIS data 
            from coastal and satellite systems, ensuring navigation safety and operational efficiency.
          </p>
          <Link
            href="/login"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
          >
            <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center gap-6 p-6 md:w-3/5 md:px-28 md:py-12">
          {/* add platform image here */}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-center">
        <p className="text-gray-500 text-sm md:text-base">
          Project for the <strong>Scalable and Distributed Computing</strong> course.
        </p>
      </div>
    </main>
  );
}
