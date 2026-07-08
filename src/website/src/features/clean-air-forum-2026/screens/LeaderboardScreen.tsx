import Image from 'next/image';

import LeaderboardRowsBlock from '@/components/clean-air-forum-2026/LeaderboardRowsBlock';
import LeaderboardToggles from '@/components/clean-air-forum-2026/LeaderboardToggles';
import Screen from '@/components/clean-air-forum-2026/Screen';

export default function LeaderboardScreen() {
  return (
    <Screen>
      <section className="caf-2026-screen mx-auto flex w-full max-w-[1600px] items-start px-5 pb-10 pt-16 sm:px-8 sm:pt-20 md:px-12 md:pt-24 lg:px-16 lg:pt-16 xl:px-20">
        <div className="flex w-full flex-col items-center">
          <div className="flex w-full justify-center lg:justify-start lg:pl-[12%] xl:pl-[9%]">
            <div className="relative w-[min(86vw,34rem)] sm:w-[min(72vw,34rem)] md:w-[min(58vw,34rem)] lg:w-[34rem] xl:w-[34.125rem]">
              <Image
                src="/clean-air-forum-2026/logos/airqo-clean-air-forum-pretoria-2026-leaderboard-logo.svg"
                alt="Africa CLEAN Air Forum Pretoria 2026"
                width={546}
                height={94}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="mt-16 w-full sm:mt-20 lg:mt-[4.7rem]">
            <LeaderboardRowsBlock />
          </div>

          <div className="mt-16 w-full sm:mt-20 lg:mt-14">
            <LeaderboardToggles />
          </div>
        </div>
      </section>
    </Screen>
  );
}
