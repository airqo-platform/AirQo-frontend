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

import { CustomButton } from '@/components/ui';
import mainConfig from '@/config/site.config';
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
    <div className="flex w-full flex-col space-y-16 pb-12">
      <section className="border-b border-[#e4e4e7] bg-[#FAFBFC]">
        <div className={`${mainConfig.containerClass} py-12 lg:py-16 px-4`}>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-[13px] text-[#71717a]">Developers</span>
                <span className="text-[13px] text-[#a1a1aa]">/</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#e4e4e7] bg-white text-[11px] font-medium text-[#52525b] rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  AirQo DevCon 2026
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 text-[13px] text-[#71717a]">
                  <FiMapPin className="w-3.5 h-3.5" /> Makerere University
                </span>
                <span className="text-[#d4d4d8]">&middot;</span>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-[#71717a]">
                  <FiCalendar className="w-3.5 h-3.5" /> 17&ndash;18 June 2026
                </span>
                <span className="text-[#d4d4d8]">&middot;</span>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-[#059669]">
                  <FiCheckCircle className="w-3.5 h-3.5" /> Applications open
                </span>
              </div>
              <h1 className="text-[32px] md:text-[36px] font-semibold tracking-[-0.025em] text-[#18181b] leading-[1.15] mb-4">
                Build the Future of Clean Air
              </h1>
              <p className="text-[16px] text-[#71717a] leading-[1.6] max-w-lg mb-5">
                A 2-day hands-on DevCon for engineering, computer science, and
                tech-curious students ready to design, build, and deploy
                real-world air quality solutions across Uganda.
              </p>
              <p className="text-[14px] font-medium text-[#18181b] mb-6">
                Learn. Build. Break things. Fix them. Ship.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={DEVCON_APPLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CustomButton className="px-5 py-3 text-[13px]">
                    Apply Now
                    <FiExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </CustomButton>
                </a>
                <Link href="#devcon-tracks">
                  <CustomButton className="px-5 py-3 text-[13px] bg-white text-[#18181b] border border-[#e4e4e7] hover:bg-[#f4f4f5]">
                    Explore tracks
                  </CustomButton>
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <Image
                src={DEVCON_IMAGE_SRC}
                alt="AirQo DevCon"
                width={720}
                height={540}
                priority
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4">
        <div
          className={`${mainConfig.containerClass} grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center`}
        >
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-blue-600">
              Countdown
            </p>
            <h2 className="text-[20px] md:text-[24px] font-semibold tracking-[-0.015em] text-[#18181b] mb-3">
              June 17, 2026 build window starts in.
            </h2>
            <p className="text-[15px] text-[#71717a] leading-[1.6]">
              AirQo DevCon runs on 17&ndash;18 June 2026 at Makerere University.
              Register your interest now and we will share joining details and
              preparation notes with registered students.
            </p>
          </div>
          <div>
            <CountdownTimer targetDate={DEVCON_COUNTDOWN_TARGET} />
          </div>
        </div>
      </section>

      <section className="bg-blue-50">
        <div className={`${mainConfig.containerClass} py-10 px-4`}>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {devconStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="border border-[#e4e4e7] rounded-lg p-4"
                >
                  <Icon className="w-5 h-5 text-[#71717a] mb-3" />
                  <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#a1a1aa] mb-1">
                    {stat.label}
                  </p>
                  <p className="text-[15px] font-semibold text-[#18181b]">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${mainConfig.containerClass} px-4`}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-blue-600 mb-2">
              About AirQo DevCon
            </p>
            <h2 className="text-[24px] md:text-[28px] font-semibold tracking-[-0.02em] text-[#18181b] mb-3">
              Uganda&apos;s most technical student event.
            </h2>
            <p className="text-[15px] text-[#71717a] leading-[1.6] mb-3">
              AirQo DevCon is a boots-on-the-ground, full-stack workshop where
              students get hands-on with real hardware, ship real code, and
              train real AI models in service of cleaner air for African cities.
            </p>
            <p className="text-[15px] text-[#71717a] leading-[1.6]">
              AirQo is a national asset. This is a chance for students to learn
              how the systems behind clean air data are built, maintained, and
              improved.
            </p>
          </div>

          <div className="grid gap-3">
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.title}
                  className="border border-[#e4e4e7] rounded-lg p-5"
                >
                  <div className="flex gap-4">
                    <Icon className="w-5 h-5 text-[#71717a] mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#18181b] mb-1.5">
                        {track.title}
                      </h3>
                      <p className="text-[14px] text-[#71717a] leading-[1.6]">
                        {track.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="devcon-tracks" className="bg-[#EDF3FF]">
        <div className={`${mainConfig.containerClass} py-12 px-4`}>
          <div className="mb-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-blue-600 mb-2">
              Your track
            </p>
            <h2 className="text-[24px] md:text-[28px] font-semibold tracking-[-0.02em] text-[#18181b]">
              Pick your superpower.
            </h2>
          </div>
          <div className="border border-[#e4e4e7] rounded-lg divide-y divide-[#e4e4e7]">
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <article
                  key={track.title}
                  className="p-6 grid gap-4 lg:grid-cols-[48px_1fr_200px] lg:items-start"
                >
                  <Icon className="w-6 h-6 text-[#71717a] mt-0.5" />
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#18181b] mb-2">
                      {track.title}
                    </h3>
                    <p className="text-[14px] text-[#71717a] leading-[1.6]">
                      {track.description}
                    </p>
                  </div>
                  <div className="bg-[#f4f4f5] rounded-md p-3">
                    <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#a1a1aa] mb-1.5">
                      Toolkit
                    </p>
                    <p className="text-[13px] text-[#52525b]">
                      {track.tools.join(' / ')}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e4e4e7]">
        <div className={`${mainConfig.containerClass} py-12 px-4`}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-blue-600 mb-2">
                What you leave with
              </p>
              <h2 className="text-[24px] md:text-[28px] font-semibold tracking-[-0.02em] text-[#18181b] mb-3">
                Practical skills, open-source credits, and proof you built
                something real.
              </h2>
              <p className="text-[15px] text-[#71717a] leading-[1.6]">
                The event is designed for students who want more than a talk.
              </p>
            </div>
            <div className="border border-[#e4e4e7] rounded-lg p-5">
              <ul className="space-y-3">
                {outcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex gap-2.5 text-[14px] text-[#52525b]"
                  >
                    <FiCheckCircle className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={`${mainConfig.containerClass} py-12 px-4`}>
          <div className="bg-blue-600 rounded-lg p-6 lg:p-8 text-white">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-[24px] md:text-[28px] font-semibold tracking-[-0.02em] mb-2">
                  Spots are limited. Apply while registration is open.
                </h2>
                <p className="text-[14px] text-blue-100">
                  Free to attend &middot; Official AirQo gear &middot;
                  Certificate &middot; Open-source credits
                </p>
              </div>
              <a
                href={DEVCON_APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CustomButton className="px-5 py-3 text-[13px] bg-white text-blue-600 hover:bg-blue-50">
                  Apply Now
                  <FiExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </CustomButton>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AirQoDevConPage;
