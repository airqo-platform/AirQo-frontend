import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

import Screen from '@/components/clean-air-forum-2026/Screen';
import { CLEAN_AIR_FORUM_2026_QUIZ_ROUTE } from '@/features/clean-air-forum-2026/constants/learn';

export default function LandingScreen() {
  return (
    <Screen>
      <section className="caf-2026-screen mx-auto flex w-full max-w-[1600px] items-start px-5 pb-10 pt-20 sm:px-8 sm:pt-24 md:px-12 md:pt-28 lg:px-16 lg:pt-36 xl:px-20">
        <div className="flex w-full justify-center lg:justify-start lg:pl-[6%] xl:pl-[8%]">
          <div className="flex w-full max-w-[34.125rem] flex-col items-start gap-24 sm:gap-28 lg:gap-36">
            <div className="relative w-[min(86vw,34rem)] sm:w-[min(72vw,34rem)] md:w-[min(58vw,34rem)] lg:w-[34rem] xl:w-[34.125rem]">
              <Image
                src="/clean-air-forum-2026/logos/airqo-clean-air-forum-pretoria-2026-logo.svg"
                alt="Africa CLEAN Air Forum Pretoria 2026"
                width={546}
                height={94}
                priority
                className="h-auto w-full"
              />
            </div>

            <Link
              href={CLEAN_AIR_FORUM_2026_QUIZ_ROUTE}
              aria-label="Attempt Quiz"
              className="group mt-6 inline-flex items-center gap-3 rounded-[1.75rem] bg-transparent text-left text-white transition-transform duration-200 ease-out hover:translate-x-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20 active:translate-y-1 active:opacity-90 sm:mt-0"
            >
              <span className="max-w-[11.5ch] text-balance text-[clamp(3rem,8vw,6.25rem)] font-bold leading-[0.98] tracking-[-0.02em]">
                Attempt Quiz
              </span>
              <span className="mt-2 inline-flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:translate-x-1 group-active:scale-95">
                <FiArrowRight className="h-7 w-7 sm:h-9 sm:w-9 lg:h-12 lg:w-12 xl:h-14 xl:w-14" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </Screen>
  );
}
