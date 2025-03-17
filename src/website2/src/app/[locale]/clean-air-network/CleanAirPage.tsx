'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import ContentSection from '@/views/cleanAirNetwork/ContentSection';
import FeaturedEvent from '@/views/cleanAirNetwork/FeaturedEvent';

const CleanAirPage = () => {
  const t = useTranslations('cleanAirNetwork');

  const goals = [
    {
      id: 1,
      title: t('goals.enhancingCapacity.title'),
      description: t('goals.enhancingCapacity.description'),
      icon: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132391/website/cleanAirForum/images/goal1_xebb2a.webp',
    },
    {
      id: 2,
      title: t('goals.collaboration.title'),
      description: t('goals.collaboration.description'),
      icon: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/goal2_hwv6m6.webp',
    },
    {
      id: 3,
      title: t('goals.cleanAirSolutions.title'),
      description: t('goals.cleanAirSolutions.description'),
      icon: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/goal3_y9cj9l.webp',
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="max-w-5xl mx-auto w-full">
        <ContentSection
          title={t('intro.title')}
          description={
            <p>
              <span className="text-blue-700 font-medium">
                {t('intro.subtitle')}
              </span>
              <br />
              {t('intro.description')}
            </p>
          }
          buttonText={t('intro.buttonText')}
          buttonLink="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
          titleClassName="text-4xl lg:text-[56px] leading-[1.1]"
          contentClassName="text-left space-y-4"
          buttonClassName="rounded-none"
          imgSrc="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/section1_usfuoj.webp"
          imgAlt={t('intro.imgAlt')}
          reverse={true}
        />
      </div>

      <section className="relative bg-blue-50 w-full h-[600px] lg:h-screen lg:mt-40 flex flex-col py-8 lg:py-20 justify-start items-center text-center">
        {/* Text Content */}
        <div className="z-10 max-w-5xl px-4">
          <p className="text-sm lg:text-2xl text-gray-600 mb-2">
            <span className="text-blue-700 font-semibold">CLEAN-Air</span>,{' '}
            {t('acronym.intro')}
          </p>
          <h1 className="text-2xl lg:text-[48px] leading-[1.1] font-medium mb-4">
            {t('acronym.fullName')}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {t('acronym.description')}
          </p>
          <p className="text-sm text-gray-600">
            {t('acronym.invitation')}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
              target="_blank"
              rel="noreferrer noopener"
              className="text-blue-600 font-semibold hover:underline"
            >
              {t('acronym.joinLink')}
            </a>
          </p>
        </div>

        {/* Background Image */}
        <div className="absolute bottom-0 w-full">
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/section2_jnqqyu.webp"
            alt={t('acronym.imgAlt')}
            layout="responsive"
            width={1200}
            height={400}
            className="object-cover"
          />
        </div>
      </section>

      <div className="max-w-5xl mx-auto w-full mt-16">
        <ContentSection
          subtitle={t('mission.subtitle')}
          title={t('mission.title')}
          description={<p>{t('mission.description')}</p>}
          contentClassName="text-left space-y-4"
          buttonClassName="hidden"
          imgSrc="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132391/website/cleanAirForum/images/section3_vgzcbs.webp"
          imgAlt={t('mission.imgAlt')}
          reverse={true}
        />
      </div>

      <div className="max-w-5xl mx-auto w-full mt-16">
        <ContentSection
          subtitle={t('membership.subtitle')}
          title={t('membership.title')}
          description={
            <div className="space-y-3">
              <p>{t('membership.description')}</p>
              <p>{t('membership.invitation')}</p>
            </div>
          }
          contentClassName="text-left space-y-4"
          buttonClassName="hidden"
          imgSrc="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132391/website/cleanAirForum/images/section4_kudfs4.webp"
          imgAlt={t('membership.imgAlt')}
          reverse={false}
        />
      </div>

      <section className="bg-blue-50 w-full mt-16">
        <div className="max-w-5xl mx-auto w-full py-16 px-4 lg:px-0">
          <div className="text-left mb-12">
            <span className="text-blue-600 text-[14px] bg-white rounded-full py-1 px-4 font-semibold mb-2 inline-block">
              {t('goals.subtitle')}
            </span>
            <h2 className="text-4xl lg:text-[48px] leading-[1.1] font-medium">
              {t('goals.title')}
            </h2>
          </div>

          <div className="space-y-16">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex flex-col lg:flex-row items-center lg:gap-4"
              >
                {/* Icon Section */}
                <div className="w-[231px] h-[174px] mb-6 lg:mb-0">
                  <Image
                    src={goal.icon || '/placeholder.svg'}
                    alt={goal.title}
                    width={192}
                    height={176}
                    className="object-cover rounded-lg"
                  />
                </div>

                {/* Content Section */}
                <div className="flex-1">
                  <h3 className="text-3xl lg:text-[32px] leading-[1.1] font-medium mb-2">
                    {goal.title}
                  </h3>
                  <p className="text-[20px] text-gray-600">
                    {goal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedEvent />
    </div>
  );
};

export default CleanAirPage;
