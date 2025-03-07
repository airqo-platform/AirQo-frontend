'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type React from 'react';
import { useState } from 'react';

import { CustomButton } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useImpactNumbers } from '@/hooks/useApiHooks';

import { Accordion } from './Accordion';
import { accordionItems, partnerLogos, statItems } from './data';

const HomeStatsSection: React.FC = () => {
  const { data: impactNumbers } = useImpactNumbers();
  const [activeTab, setActiveTab] = useState<'cities' | 'communities'>(
    'cities',
  );

  return (
    <section className="py-8 px-4 w-full space-y-20 bg-[#ECF2FF]">
      <div className={`${mainConfig.containerClass} space-y-16`}>
        <PartnerLogosSection />
        <HeadingSection activeTab={activeTab} setActiveTab={setActiveTab} />
        <AccordionAndImageSection activeTab={activeTab} />
      </div>
      <StatisticsSection impactNumbers={impactNumbers} />
    </section>
  );
};

const PartnerLogosSection: React.FC = () => {
  const t = useTranslations('homeStatsSection');
  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center space-y-6">
        <h3 className="text-lg font-semibold text-gray-500">
          {t('partnerLogos.title')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {partnerLogos.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center h-[100px] p-4 border border-gray-300"
            >
              <Image
                src={partner || '/placeholder.svg'}
                alt={t('partnerLogos.altText', { index: index + 1 })}
                width={120}
                height={50}
                className="mix-blend-multiply w-auto h-auto transition-transform duration-500 ease-in-out transform hover:scale-110 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HeadingSection: React.FC<{
  activeTab: 'cities' | 'communities';
  setActiveTab: (tab: 'cities' | 'communities') => void;
}> = ({ activeTab, setActiveTab }) => {
  const t = useTranslations('homeStatsSection');
  return (
    <div className="text-center space-y-6">
      <h2 className="text-3xl lg:text-5xl font-bold">{t('heading.title')}</h2>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
        {t('heading.description')}
      </p>
      <div className="flex justify-center items-center gap-0 relative">
        <CustomButton
          onClick={() => setActiveTab('cities')}
          className={`px-6 py-3 ${
            activeTab === 'cities'
              ? 'bg-[#2E3A59] text-white z-10 scale-105 rounded-xl'
              : 'bg-[#DFE8F9] text-[#2E3A59] -ml-1 rounded-l-xl'
          } border border-[#DFE8F9]`}
        >
          {t('heading.forAfricanCities')}
        </CustomButton>
        <CustomButton
          onClick={() => setActiveTab('communities')}
          className={`px-6 py-3 ${
            activeTab === 'communities'
              ? 'bg-[#2E3A59] text-white z-10 scale-105 rounded-xl'
              : 'bg-[#DFE8F9] text-[#2E3A59] -ml-1 rounded-r-xl'
          } border border-[#DFE8F9]`}
        >
          {t('heading.forCommunities')}
        </CustomButton>
      </div>
    </div>
  );
};

const AccordionAndImageSection: React.FC<{
  activeTab: 'cities' | 'communities';
}> = ({ activeTab }) => {
  const t = useTranslations('homeStatsSection');
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
      <div className="lg:w-1/2 w-full">
        <Accordion
          items={accordionItems[activeTab].map((item) => ({
            title: t(item.titleKey),
            content: t(item.contentKey),
          }))}
        />
      </div>
      <div className="lg:w-1/2 w-full rounded-lg">
        <div className="relative w-full h-[400px] overflow-hidden">
          <Image
            src={`${
              activeTab === 'cities'
                ? 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp'
                : 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1726578795/website/photos/ForCommunities_oepvth.webp'
            }`}
            alt={t('accordionAndImage.altText')}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-lg object-contain flex justify-self-center w-full h-full max-w-[440px] transition-transform duration-500 ease-in-out transform hover:scale-110 cursor-pointer"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};

const StatisticsSection: React.FC<{ impactNumbers: any }> = ({
  impactNumbers,
}) => {
  const t = useTranslations('homeStatsSection');
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
      {statItems.map((stat, index) => (
        <div
          key={index}
          className="h-[240px] p-6 bg-[#DFE8F9] rounded-lg flex flex-col justify-between items-start space-y-4"
        >
          <div className="text-left flex flex-col items-start">
            <p className="text-3xl font-bold">
              {impactNumbers?.[stat.key] ?? 0}+
            </p>
            <p className="text-gray-600">{t(`statistics.${stat.key}`)}</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full">
            <Image
              src={stat.icon || '/placeholder.svg'}
              alt={t(`statistics.${stat.key}`)}
              width={30}
              height={30}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeStatsSection;
