'use client';

import dynamic from 'next/dynamic';

const StatisticsSection = dynamic(() => import('./HomeStatsSection'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[58rem] w-full rounded-[2rem] bg-[#ECF2FF] animate-pulse" />
  ),
});

const AirQualityBillboard = dynamic(
  () => import('@/components/sections/AirQualityBillboard'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[32rem] w-full rounded-[1.5rem] bg-blue-100 animate-pulse" />
    ),
  },
);

const FeaturedCarousel = dynamic(() => import('./FeaturedCarousel'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[40rem] w-full rounded-[1.5rem] bg-[#F0F4FA] animate-pulse md:min-h-[34rem]" />
  ),
});

export default function HomeDeferredSections() {
  return (
    <>
      <StatisticsSection />
      <AirQualityBillboard homepage className="px-2 md:px-3" />
      <FeaturedCarousel />
    </>
  );
}
