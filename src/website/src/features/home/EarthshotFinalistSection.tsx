import Image from 'next/image';

const EARTHSHOT_BADGE_SRC = '/assets/images/earthshot_badge.webp';

export default function EarthshotFinalistSection() {
  return (
    <section
      aria-labelledby="earthshot-heading"
      className="w-full rounded-2xl border border-amber-200/60 bg-gradient-to-br from-[#ECF2FF] via-white to-amber-50/40 px-6 py-8 shadow-sm ring-1 ring-amber-100/40 sm:px-10 sm:py-10"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
        {/* Badge – responsive wrapper so fill is contained without explicit px/px mismatch */}
        <div className="relative h-[140px] w-[140px] flex-shrink-0 overflow-hidden rounded-2xl bg-white/60 p-3 shadow-sm ring-1 ring-black/5 sm:h-[180px] sm:w-[180px]">
          <Image
            src={EARTHSHOT_BADGE_SRC}
            alt="Earthshot Prize Finalist 2025 badge"
            fill
            priority
            sizes="180px"
            className="object-contain"
          />
        </div>

        {/* Copy */}
        <div className="flex flex-col items-center space-y-4 text-center sm:items-start sm:text-left">
          <h2
            id="earthshot-heading"
            className="text-2xl font-bold text-[#2E3A59] sm:text-3xl"
          >
            Earthshot Prize Finalist 2025
          </h2>
          <p className="max-w-xl leading-relaxed text-gray-600">
            AirQo is a 2025 Earthshot Prize Finalist in the Clean Our Air
            category. This recognition celebrates our work to close air quality
            data gaps and help cities turn hyperlocal air quality information
            into action for cleaner air.
          </p>
          <a
            href="https://earthshotprize.org/winners-finalists/airqo/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2E3A59] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1C2540] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A84E]"
          >
            Discover our Earthshot journey
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
