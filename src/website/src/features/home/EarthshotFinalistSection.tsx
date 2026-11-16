import Image from 'next/image';
import { FiArrowUpRight } from 'react-icons/fi';

import mainConfig from '@/config/site.config';

const EARTHSHOT_BADGE_SRC = '/assets/images/earthshot_badge.webp';

export default function EarthshotFinalistSection() {
  return (
    <section
      aria-labelledby="earthshot-heading"
      className="border-y border-line bg-white"
    >
      <div
        className={`${mainConfig.containerClass} flex flex-col items-center gap-6 px-4 py-8 sm:flex-row sm:items-center sm:gap-10 sm:px-6 sm:py-10 lg:px-8`}
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-line bg-surface-muted p-2">
          <Image
            src={EARTHSHOT_BADGE_SRC}
            alt="Earthshot Prize Finalist 2026 badge"
            fill
            priority
            sizes="80px"
            className="object-contain"
          />
        </div>

        <div className="flex min-w-0 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <h2
            id="earthshot-heading"
            className="text-lg font-semibold tracking-tight text-ink sm:text-xl"
          >
            Earthshot Prize Finalist 2026
          </h2>
          <p className="max-w-2xl text-base leading-7 text-gray-600">
            AirQo is a 2026 Earthshot Prize Finalist in the Clean Our Air
            category, recognised for closing air quality data gaps and helping
            cities turn hyperlocal air quality information into action.
          </p>
          <a
            href="https://earthshotprize.org/winners-finalists/airqo/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Discover our Earthshot story
            <FiArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
