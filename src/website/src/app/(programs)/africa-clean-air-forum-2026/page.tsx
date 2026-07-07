import {
  generateMetadata as createMetadata,
  generateViewport,
} from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Africa Clean Air Forum 2026',
  description:
    'Live event experience for the Africa Clean Air Forum 2026 stall.',
  url: '/africa-clean-air-forum-2026',
});

export const viewport = generateViewport();

const page = () => {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_#ffffff_42%,_#ecfdf5)]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 sm:px-10">
        <div className="grid w-full gap-10 rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur sm:p-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold tracking-wide text-sky-700">
              Pretoria 2026
            </p>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Clean Air Forum interactive quiz and live leaderboard
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                This is the placeholder home screen for the stall experience. We
                will use this route to build the guest flow, quiz journey, and
                leaderboard display.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                Guest usernames
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                Quiz flow
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                Leaderboard
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full rounded-[1.5rem] bg-slate-900 p-6 text-white shadow-lg">
              <p className="text-sm uppercase tracking-[0.2em] text-sky-200">
                Demo screen
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Top player</p>
                  <p className="mt-1 text-2xl font-semibold">Guest_001</p>
                  <p className="text-sm text-emerald-300">240 points</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Status</p>
                  <p className="mt-1 text-lg font-medium">
                    Main event landing screen is live
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
