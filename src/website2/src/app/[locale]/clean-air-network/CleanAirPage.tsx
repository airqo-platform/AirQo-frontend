<<<<<<<< HEAD:src/website2/src/app/[locale]/clean-air-network/CleanAirPage.tsx
'use client';
import Image from 'next/image';
import React from 'react';

import ContentSection from '@/views/cleanairforum/ContentSection';
import FeaturedEvent from '@/views/cleanairforum/FeaturedEvent';

const CleanAirPage = () => {
  const goals = [
    {
      id: 1,
      title: 'Enhancing Regional Capacity',
      description:
        'Dedicated to improving capacity in air quality monitoring, modeling, data management, and access through scaling up of ongoing localized initiatives in African Cities.',
      icon: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132391/website/cleanAirForum/images/goal1_xebb2a.webp',
    },
    {
      id: 2,
      title: 'Collaboration and Awareness',
      description:
        'Committed to fostering a deeper understanding, awareness, and appreciation of air quality issues through evidence-informed and participatory advocacy, and knowledge sharing.',
      icon: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/goal2_hwv6m6.webp',
    },
    {
      id: 3,
      title: 'Clean Air Solutions for Cities',
      description:
        'CLEAN-Air network is a nexus for developing tangible and contextual clean air solutions and frameworks for African cities.',
      icon: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/goal3_y9cj9l.webp',
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="max-w-5xl mx-auto w-full">
        <ContentSection
          title="The CLEAN-Air Network"
          description={
            <p>
              <span className="text-blue-700 font-medium">
                An African-led, multi-regional network
              </span>
              <br />
              bringing together a community of practice for air quality
              solutions and air quality management across Africa.
            </p>
          }
          buttonText="Join the Network"
          buttonLink="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
          titleClassName="text-4xl lg:text-[56px] leading-[1.1]"
          contentClassName="text-left space-y-4"
          buttonClassName="rounded-none"
          imgSrc="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/section1_usfuoj.webp"
          imgAlt="Mission Image"
          reverse={true}
        />
      </div>

      <section className="relative bg-blue-50 w-full h-[600px] lg:h-screen lg:mt-40 flex flex-col py-8 lg:py-20 justify-start items-center text-center">
        {/* Text Content */}
        <div className="z-10 max-w-5xl px-4">
          <p className="text-sm lg:text-2xl text-gray-600 mb-2">
            <span className="text-blue-700 font-semibold">CLEAN-Air</span>, is
            an acronym coined from
          </p>
          <h1 className="text-2xl lg:text-[48px] leading-[1.1] font-medium mb-4">
            “Championing Liveable urban Environments through African Networks
            for Air”
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            The network brings together stakeholders and researchers in air
            quality management to share best practices and knowledge on
            developing and implementing air quality management solutions in
            African cities.
          </p>
          <p className="text-sm text-gray-600">
            Are you an organization or individual interested in air quality in
            Africa?
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
              target="_blank"
              className="text-blue-600 font-semibold hover:underline"
            >
              Join the network
            </a>
          </p>
        </div>

        {/* Background Image */}
        <div className="absolute bottom-0 w-full">
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/section2_jnqqyu.webp"
            alt="Urban Scene"
            layout="responsive"
            width={1200}
            height={400}
            className="object-cover"
          />
        </div>
      </section>

      <div className="max-w-5xl mx-auto w-full mt-16">
        <ContentSection
          subtitle="Mission"
          title="The CLEAN-Air Mission"
          description={
            <p>
              To strengthen regional networks for sustained partnerships and
              enable partners to co-develop solutions that enhance the capacity
              for air quality monitoring, modelling and management across cities
              in Africa.
            </p>
          }
          contentClassName="text-left space-y-4"
          buttonClassName="hidden"
          imgSrc="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132391/website/cleanAirForum/images/section3_vgzcbs.webp"
          imgAlt="Mission Image"
          reverse={true}
        />
      </div>

      <div className="max-w-5xl mx-auto w-full mt-16">
        <ContentSection
          subtitle="Membership"
          title="A Synergy for Air Quality in Africa"
          description={
            <div className="space-y-3">
              <p>
                The network comprises a diverse stakeholder landscape including
                research organisations, city and national governments, the
                private sector, development partners, and individuals who are
                championing the air quality agenda in African cities.
              </p>
              <p>
                Are you an organization or individual interested in air quality
                in Africa? We welcome you to join the CLEAN-Air Network.
              </p>
            </div>
          }
          contentClassName="text-left space-y-4"
          buttonClassName="hidden"
          imgSrc="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132391/website/cleanAirForum/images/section4_kudfs4.webp"
          imgAlt="Synergy Image"
          reverse={false}
        />
      </div>

      <section className="bg-blue-50 w-full mt-16">
        <div className="max-w-5xl mx-auto w-full py-16 px-4 lg:px-0">
          <div className="text-left mb-12">
            <span className="text-blue-600 text-[14px] bg-white rounded-full py-1 px-4 font-semibold mb-2 inline-block">
              Goals
            </span>
            <h2 className="text-4xl lg:text-[48px] leading-[1.1] font-medium">
              CLEAN Air Goals
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
                    src={goal.icon}
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
========
'use client';
import Image from 'next/image';
import React from 'react';

import ContentSection from '@/views/cleanAirNetwork/ContentSection';
import FeaturedEvent from '@/views/cleanAirNetwork/FeaturedEvent';

const CleanAirPage = () => {
  const goals = [
    {
      id: 1,
      title: 'Enhancing Regional Capacity',
      description:
        'Dedicated to improving capacity in air quality monitoring, modeling, data management, and access through scaling up of ongoing localized initiatives in African Cities.',
      icon: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132391/website/cleanAirForum/images/goal1_xebb2a.webp',
    },
    {
      id: 2,
      title: 'Collaboration and Awareness',
      description:
        'Committed to fostering a deeper understanding, awareness, and appreciation of air quality issues through evidence-informed and participatory advocacy, and knowledge sharing.',
      icon: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/goal2_hwv6m6.webp',
    },
    {
      id: 3,
      title: 'Clean Air Solutions for Cities',
      description:
        'CLEAN-Air network is a nexus for developing tangible and contextual clean air solutions and frameworks for African cities.',
      icon: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/goal3_y9cj9l.webp',
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="max-w-5xl mx-auto w-full">
        <ContentSection
          title="The CLEAN-Air Network"
          description={
            <p>
              <span className="text-blue-700 font-medium">
                An African-led, multi-regional network
              </span>
              <br />
              bringing together a community of practice for air quality
              solutions and air quality management across Africa.
            </p>
          }
          buttonText="Join the Network"
          buttonLink="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
          titleClassName="text-4xl lg:text-[56px] leading-[1.1]"
          contentClassName="text-left space-y-4"
          buttonClassName="rounded-none"
          imgSrc="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/section1_usfuoj.webp"
          imgAlt="Mission Image"
          reverse={true}
        />
      </div>

      <section className="relative bg-blue-50 w-full h-[600px] lg:h-screen lg:mt-40 flex flex-col py-8 lg:py-20 justify-start items-center text-center">
        {/* Text Content */}
        <div className="z-10 max-w-5xl px-4">
          <p className="text-sm lg:text-2xl text-gray-600 mb-2">
            <span className="text-blue-700 font-semibold">CLEAN-Air</span>, is
            an acronym coined from
          </p>
          <h1 className="text-2xl lg:text-[48px] leading-[1.1] font-medium mb-4">
            “Championing Liveable urban Environments through African Networks
            for Air”
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            The network brings together stakeholders and researchers in air
            quality management to share best practices and knowledge on
            developing and implementing air quality management solutions in
            African cities.
          </p>
          <p className="text-sm text-gray-600">
            Are you an organization or individual interested in air quality in
            Africa?
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
              target="_blank"
              className="text-blue-600 font-semibold hover:underline"
            >
              Join the network
            </a>
          </p>
        </div>

        {/* Background Image */}
        <div className="absolute bottom-0 w-full">
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/section2_jnqqyu.webp"
            alt="Urban Scene"
            layout="responsive"
            width={1200}
            height={400}
            className="object-cover"
          />
        </div>
      </section>

      <div className="max-w-5xl mx-auto w-full mt-16">
        <ContentSection
          subtitle="Mission"
          title="The CLEAN-Air Mission"
          description={
            <p>
              To strengthen regional networks for sustained partnerships and
              enable partners to co-develop solutions that enhance the capacity
              for air quality monitoring, modelling and management across cities
              in Africa.
            </p>
          }
          contentClassName="text-left space-y-4"
          buttonClassName="hidden"
          imgSrc="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132391/website/cleanAirForum/images/section3_vgzcbs.webp"
          imgAlt="Mission Image"
          reverse={true}
        />
      </div>

      <div className="max-w-5xl mx-auto w-full mt-16">
        <ContentSection
          subtitle="Membership"
          title="A Synergy for Air Quality in Africa"
          description={
            <div className="space-y-3">
              <p>
                The network comprises a diverse stakeholder landscape including
                research organisations, city and national governments, the
                private sector, development partners, and individuals who are
                championing the air quality agenda in African cities.
              </p>
              <p>
                Are you an organization or individual interested in air quality
                in Africa? We welcome you to join the CLEAN-Air Network.
              </p>
            </div>
          }
          contentClassName="text-left space-y-4"
          buttonClassName="hidden"
          imgSrc="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132391/website/cleanAirForum/images/section4_kudfs4.webp"
          imgAlt="Synergy Image"
          reverse={false}
        />
      </div>

      <section className="bg-blue-50 w-full mt-16">
        <div className="max-w-5xl mx-auto w-full py-16 px-4 lg:px-0">
          <div className="text-left mb-12">
            <span className="text-blue-600 text-[14px] bg-white rounded-full py-1 px-4 font-semibold mb-2 inline-block">
              Goals
            </span>
            <h2 className="text-4xl lg:text-[48px] leading-[1.1] font-medium">
              CLEAN Air Goals
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
                    src={goal.icon}
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
>>>>>>>> origin/staging:src/website2/src/views/cleanAirNetwork/about/CleanAirPage.tsx
