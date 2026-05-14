import Image from 'next/image';
import Link from 'next/link';
import type { IconType } from 'react-icons';
import {
  FiAward,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiCode,
  FiCpu,
  FiExternalLink,
  FiMapPin,
  FiTool,
  FiUsers,
} from 'react-icons/fi';

import mainConfig from '@/configs/mainConfigs';
import {
  DEVCON_APPLY_URL,
  DEVCON_COUNTDOWN_TARGET,
  DEVCON_IMAGE_SRC,
} from '@/lib/devcon';

import CountdownTimer from './CountdownTimer';

type InfoCard = {
  icon: IconType;
  label: string;
  value: string;
};

type Track = {
  title: string;
  icon: IconType;
  description: string;
  tools: string[];
};

const devconStats: InfoCard[] = [
  { icon: FiCalendar, label: 'Duration', value: '2 intensive days' },
  { icon: FiCpu, label: 'Track', value: '1 build track' },
  { icon: FiTool, label: 'Format', value: '100% hands on' },
  { icon: FiUsers, label: 'Access', value: 'Free for students' },
  { icon: FiAward, label: 'Finish line', value: 'Gear + certificate' },
];

const focusAreas: InfoCard[] = [
  {
    icon: FiCpu,
    label: 'Hardware & Firmware',
    value: 'CAD design, PCB layouts, soldering, and sensor assembly.',
  },
  {
    icon: FiCode,
    label: 'Software & Deployment',
    value: 'APIs, dashboards, cloud pipelines, and open-source contribution.',
  },
  {
    icon: FiBarChart2,
    label: 'Data Science & AI',
    value: 'Air quality modelling, ML analysis, and predictive systems.',
  },
];

const tracks: Track[] = [
  {
    title: 'Hardware & Firmware',
    icon: FiCpu,
    description:
      'Get physical. Design enclosures in CAD, lay out PCBs in KiCad, solder components, flash firmware, and diagnose broken sensors. The Repair Challenge will test your debugging nerves.',
    tools: ['KiCad', 'Onshape', '3D Printing', 'C/C++', 'Soldering'],
  },
  {
    title: 'Software & Deployment',
    icon: FiCode,
    description:
      "Build the stack, from data ingestion APIs to real-time dashboards. Contribute directly to AirQo's open-source codebase and see your code run in the wild.",
    tools: ['Python', 'Node.js', 'React', 'APIs', 'Open Source'],
  },
  {
    title: 'AI & Data Science',
    icon: FiBarChart2,
    description:
      'Make the data speak. Train models to predict air quality events, build alerting systems, and generate insights that help Ugandan cities breathe better. Real data. Real impact.',
    tools: ['Python', 'ML', 'pandas', 'scikit-learn', 'Visualisation'],
  },
];

const outcomes = [
  'Practical skills that match real engineering work.',
  "A network of Uganda's sharpest student builders.",
  'A certificate of completion and open-source credits.',
  'A shot at official AirQo gear and AirQo squad membership.',
  'Hands-on experience with clean air technology that matters.',
];

const AirQoDevConPage = () => {
  return (
    <div className="flex w-full flex-col space-y-20 pb-16">
      <section className="bg-blue-50 px-4 py-16">
        <div
          className={`${mainConfig.containerClass} grid grid-cols-1 items-center gap-12 md:grid-cols-2`}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-[14px] text-gray-500">
              <span>Developers {'>'}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-700 shadow-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full bg-blue-600"
                  aria-hidden="true"
                />
                AirQo DevCon 2026
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-medium text-blue-700">
                <FiMapPin aria-hidden="true" />
                Makerere University
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-medium text-blue-700">
                <FiCalendar aria-hidden="true" />
                17 - 18 June 2026
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-medium text-blue-700">
                <FiCheckCircle aria-hidden="true" />
                Applications open
              </span>
            </div>
            <h1 className="max-w-xl text-[44px] font-bold leading-[52px] text-gray-900 md:text-[48px] md:leading-[56px]">
              Build the Future of Clean Air
            </h1>
            <p className="text-[18px] leading-8 text-gray-700">
              A 2-day hands-on DevCon for engineering, computer science, and
              tech-curious students ready to design, build, and deploy
              real-world air quality solutions across Uganda.
            </p>

            <p className="font-medium text-blue-700">
              Learn. Build. Break things. Fix them. Ship.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <a
                href={DEVCON_APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 px-6 py-4 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95"
              >
                Apply Now. It&apos;s Free
                <FiExternalLink aria-hidden="true" />
              </a>
              <Link
                href="#devcon-tracks"
                className="inline-flex items-center justify-center bg-blue-100 px-6 py-4 text-sm font-medium text-blue-700 transition hover:bg-blue-200 active:scale-95"
              >
                Explore tracks
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <Image
              src={DEVCON_IMAGE_SRC}
              alt="Students building air quality hardware and software at AirQo DevCon"
              width={720}
              height={540}
              priority
              className="h-auto w-full rounded-lg object-cover shadow-md"
            />
          </div>
        </div>
      </section>

      <section className="px-4">
        <div
          className={`${mainConfig.containerClass} grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center`}
        >
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
              Countdown
            </p>
            <h2 className="mb-4 text-[32px] font-semibold leading-tight text-gray-900">
              June 17, 2026 build window starts in.
            </h2>
            <p className="text-lg leading-8 text-gray-700">
              AirQo DevCon runs on 17 - 18 June 2026 at Makerere University.
              Register your interest now and we will share joining details and
              preparation notes with registered students.
            </p>
          </div>
          <div>
            <CountdownTimer targetDate={DEVCON_COUNTDOWN_TARGET} />
          </div>
        </div>
      </section>

      <section className="bg-[#EDF3FF] px-4 py-16">
        <div
          className={`${mainConfig.containerClass} grid gap-4 md:grid-cols-5`}
        >
          {devconStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-lg bg-white p-5 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className={`${mainConfig.containerClass} px-4`}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              About AirQo DevCon
            </p>
            <h2 className="text-[40px] font-semibold leading-tight text-gray-900">
              Uganda&apos;s most technical student event.
            </h2>
            <p className="text-lg leading-8 text-gray-700">
              AirQo DevCon is a boots-on-the-ground, full-stack workshop where
              students get hands-on with real hardware, ship real code, and
              train real AI models in service of cleaner air for African cities.
            </p>
            <p className="text-lg leading-8 text-gray-700">
              AirQo is a national asset. This is a chance for students to learn
              how the systems behind clean air data are built, maintained, and
              improved.
            </p>
          </div>

          <div className="grid gap-4">
            {focusAreas.map((area) => {
              const Icon = area.icon;

              return (
                <div
                  key={area.label}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-6"
                >
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-gray-900">
                        {area.label}
                      </h3>
                      <p className="leading-7 text-gray-700">{area.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="devcon-tracks" className="bg-[#EDF3FF] px-4 py-16">
        <div className={`${mainConfig.containerClass} space-y-8`}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
                Your track
              </p>
              <h2 className="text-[40px] font-semibold leading-tight text-gray-900">
                Pick your superpower.
              </h2>
            </div>
            <p className="text-lg leading-8 text-gray-700">
              Each track is practical, student-friendly, and connected to a real
              AirQo workflow.
            </p>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            {tracks.map((track) => {
              const Icon = track.icon;

              return (
                <article
                  key={track.title}
                  className="grid gap-5 border-b border-blue-100 p-6 last:border-b-0 lg:grid-cols-[56px_1fr_280px] lg:items-start"
                >
                  <div className="flex items-center lg:items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                      <Icon size={22} aria-hidden="true" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {track.title}
                    </h3>
                    <p className="mt-4 max-w-2xl leading-7 text-gray-700">
                      {track.description}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Toolkit
                    </p>
                    <p className="text-sm font-medium leading-7 text-gray-800">
                      {track.tools.join(' / ')}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${mainConfig.containerClass} px-4`}>
        <div className="grid grid-cols-1 gap-8 rounded-lg border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-green-50 p-8 lg:grid-cols-[1fr_0.8fr] lg:p-12">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              What you leave with
            </p>
            <h2 className="text-[32px] font-semibold leading-tight text-gray-900 lg:text-[40px]">
              Practical skills, open-source credits, and proof you built
              something real.
            </h2>
            <p className="text-lg leading-8 text-gray-700">
              The event is designed for students who want more than a talk. It
              is a guided build experience across hardware, software, and data.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <ul className="space-y-4">
              {outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 text-gray-700">
                  <FiCheckCircle
                    className="mt-1 flex-none text-blue-700"
                    aria-hidden="true"
                  />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4">
        <div
          className={`${mainConfig.containerClass} rounded-lg bg-blue-600 p-8 text-white lg:p-12`}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-100">
                Ready to build something real?
              </p>
              <h2 className="mb-4 text-[32px] font-semibold leading-tight lg:text-[40px]">
                Spots are limited. Apply while registration is open.
              </h2>
              <p className="text-lg leading-8 text-blue-50">
                Free to attend | Official AirQo gear | Certificate of completion
                | Open-source credits | AirQo squad membership
              </p>
              <p className="mt-3 text-sm font-medium text-blue-100">
                June 2026 at Makerere University | Event details shared with
                registered students
              </p>
            </div>
            <div>
              <a
                href={DEVCON_APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 bg-white px-6 py-4 text-sm font-medium text-blue-700 transition-transform duration-300 hover:bg-blue-50 active:scale-95 sm:w-auto"
              >
                Apply Now. It&apos;s Free
                <FiExternalLink aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AirQoDevConPage;
