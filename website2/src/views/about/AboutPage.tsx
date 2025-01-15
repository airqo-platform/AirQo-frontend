'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';

import { CustomButton, Divider, MemberCard } from '@/components/ui';
import { useDispatch } from '@/hooks/reduxHooks';
import {
  useBoardMembers,
  useExternalTeamMembers,
  usePartners,
  useTeamMembers,
} from '@/hooks/useApiHooks';
import { openModal } from '@/store/slices/modalSlice';
import PaginatedSection from '@/views/cleanairforum/PaginatedSection';

/** Skeleton Loader Component **/

const SkeletonCard: React.FC = () => (
  <div className="flex flex-col items-center space-y-4">
    <div className="w-[310px] h-[390px] bg-gray-300 rounded-lg animate-pulse"></div>
    <div className="flex items-center w-full justify-between">
      <div className="text-left w-2/3">
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-300 rounded w-1/3 animate-pulse"></div>
      </div>
      <div className="h-6 w-6 bg-gray-300 rounded-full animate-pulse"></div>
    </div>
  </div>
);

/** Main AboutPage Component **/

const AboutPage: React.FC = () => {
  const { boardMembers, isLoading: loadingBoard } = useBoardMembers();
  const { teamMembers, isLoading: loadingTeam } = useTeamMembers();
  const { externalTeamMembers, isLoading: loadingExternalTeam } =
    useExternalTeamMembers();
  const { partners } = usePartners();

  const dispatch = useDispatch();

  /** Helper Function to Render Member Sections **/
  const renderMembersSection = (
    members: any[],
    loading: boolean,
    sectionId: string,
    title: string,
  ) => {
    if (loading) {
      // Display Skeleton Loaders
      return (
        <section
          id={sectionId}
          className="max-w-5xl mx-auto w-full px-4 lg:px-0 space-y-8 scroll-mt-[100px]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        </section>
      );
    }

    if (!loading && members.length === 0) {
      return null;
    }

    // Render the actual member cards
    return (
      <>
        <section
          id={sectionId}
          className="max-w-5xl mx-auto w-full px-4 lg:px-0 space-y-8 scroll-mt-[200px]"
        >
          <div className="flex flex-col lg:flex-row items-start lg:space-x-12">
            {/* Title */}
            <h2 className="text-3xl lg:text-[48px] font-medium flex-shrink-0 w-full text-left lg:w-1/3">
              {title}
            </h2>

            {/* Content */}
            <div className="space-y-6 w-full max-w-[556px]">
              {title === 'Meet the team' && (
                <>
                  <p>
                    This is our team, a community of spirited individuals who
                    work hard to bridge the gap in air quality monitoring in
                    Africa.
                  </p>
                  <Link
                    href="/careers"
                    className="flex items-center text-blue-700"
                  >
                    <span>Join the team </span>
                    <FaArrowRightLong className="inline-block ml-2 " />
                  </Link>
                </>
              )}
              {title === 'External team' && (
                <p>
                  A team of enthusiastic experts that offer guidance to enhance
                  our growth and realisation of our goals.
                </p>
              )}
              {title === 'Meet the Board' && (
                <p>
                  A team of enthusiastic experts that offer guidance to enhance
                  our growth and realisation of our goals.
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
            {members.map((member: any, idx: any) => (
              <MemberCard key={idx} member={member} />
            ))}
          </div>
        </section>

        <Divider className="bg-black w-full p-0 h-[1px] mx-auto" />
      </>
    );
  };

  /** Navs */
  const NavLink = ({ href, label, active = false }: any) => (
    <a
      href={href}
      className={`relative pb-2 hover:text-gray-800 transition-all group ${active ? 'text-gray-800' : ''}`}
      aria-label={label}
    >
      {label}
      <span
        className={`absolute left-0 right-0 bottom-0 h-[2px] bg-black ${active ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100 transition-transform duration-300 origin-left`}
      ></span>
    </a>
  );

  return (
    <div className="pb-16 flex flex-col w-full space-y-16">
      {/* Hero Section */}
      <section className="bg-[#F3F4F6] px-4 lg:px-0 h-[300px] w-full scroll-mt-[100px]">
        <div className="max-w-5xl mx-auto w-full h-full flex flex-col justify-between">
          <div></div>
          <div className="text-left">
            <h1 className="text-2xl lg:text-[48px] font-bold text-gray-800">
              About
            </h1>
          </div>
          <nav className="flex justify-start items-baseline space-x-6 text-gray-400 overflow-x-auto w-full">
            {[
              { href: '#vision', label: 'Our Vision', active: true },
              { href: '#story', label: 'Our Story' },
              { href: '#mission', label: 'Our Mission' },
              { href: '#values', label: 'Our Values' },
              { href: '#team', label: 'Our Team' },
              { href: '#partners', label: 'Our Partners' },
            ].map(({ href, label, active }) => (
              <NavLink key={href} href={href} label={label} active={active} />
            ))}
          </nav>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="max-w-5xl mx-auto w-full px-4 lg:px-0 scroll-mt-[100px]">
        <p className="text-2xl lg:text-[48px] max-w-[800px] leading-[48px] font-medium text-left">
          At AirQo, we empower communities across Africa with accurate,
          hyperlocal, and timely air quality data to drive air pollution
          mitigation actions.
        </p>
      </section>

      {/* Vision Section */}
      <section
        id="vision"
        className="max-w-5xl mx-auto w-full px-4 lg:px-0 space-y-8 scroll-mt-[100px]"
      >
        <div className="flex flex-col-reverse relative transition-transform duration-500 ease-in-out transform hover:scale-110 cursor-pointer">
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728295735/website/photos/about/teamImage_ganc1y.png"
            alt="Abstract Outline"
            width={1024}
            height={480}
            className="object-cover w-auto h-auto"
            loading="eager"
          />
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728295909/website/photos/about/Frame_ugwgqr.png"
            alt="Abstract Outline"
            width={1024}
            height={49}
            className="absolute w-auto h-auto object-cover"
            loading="eager"
          />
        </div>
        <div className="flex flex-col lg:flex-row justify-start items-center gap-8">
          <div className="relative w-full h-[400px] flex items-center justify-center">
            {/* Background Abstract Shape Image */}
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728294910/website/photos/about/about_us_vector_3_wiw2ie.png"
              alt="Abstract Background"
              width={800}
              height={400}
              className="absolute w-[300px] h-[200px] lg:w-[410px] lg:h-[225px]"
              loading="eager"
            />

            {/* Outline Abstract Shape Image */}
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728294910/website/photos/about/about-us-vector-2_mioxcy.png"
              alt="Abstract Outline"
              width={800}
              height={400}
              className="absolute w-[350px] h-[230px] lg:w-[450px] lg:h-[300px] object-contain"
              loading="eager"
            />

            {/* Text */}
            <span className="text-gray-800 text-lg lg:text-[48px] relative">
              Our vision
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <p className="text-xl lg:text-[48px] leading-[56px] font-normal">
                Clean air for all African cities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* Story Section */}
      <section
        id="story"
        className="max-w-5xl mx-auto w-full px-4 space-y-8 scroll-mt-[150px]"
      >
        <div className="flex flex-col lg:flex-row items-start lg:space-x-12">
          {/* Title */}
          <h2 className="text-3xl lg:text-[48px] text-left w-full font-medium flex-shrink-0 lg:w-1/3">
            Our Story
          </h2>

          {/* Content */}
          <div className="space-y-6 w-full max-w-[556px]">
            <p className="text-lg text-gray-700 leading-relaxed">
              We are on a mission to empower communities across Africa with
              information about the quality of the air they breathe.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              AirQo was founded in 2015 at Makerere University to close the gaps
              in air quality monitoring across Africa. Our low-cost air quality
              monitors are designed to suit the African infrastructure,
              providing locally-led solutions to African air pollution
              challenges.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              They provide accurate, hyperlocal, and timely data providing
              evidence of the magnitude and scale of air pollution across the
              continent.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              By empowering citizens with air quality information, we hope to
              inspire change and action among African citizens to take effective
              action to reduce air pollution.
            </p>
          </div>
        </div>
      </section>

      <Divider className="bg-black w-full p-0 h-[1px] mx-auto" />

      {/* Mission Section */}
      <section
        id="mission"
        className="max-w-5xl mx-auto w-full px-4 space-y-4 scroll-mt-[150px]"
      >
        <p className="text-lg lg:text-[48px] leading-[56px] font-medium text-left">
          Our mission is to efficiently collect, analyze and forecast air
          quality data to international standards and work with partners to
          reduce air pollution and raise awareness of its effects in African
          cities.
        </p>
      </section>

      <Divider className="bg-black w-full p-0 h-[1px] mx-auto" />

      {/* Values Section */}
      <section
        id="values"
        className="max-w-5xl mx-auto w-full px-4 space-y-8 scroll-mt-[150px]"
      >
        <div className="flex flex-col lg:flex-row items-start lg:space-x-12">
          {/* Title */}
          <h2 className="text-3xl lg:text-[48px] font-medium flex-shrink-0 w-full text-left lg:w-1/3">
            Our Values
          </h2>

          {/* Content */}
          <div className="space-y-6 w-full max-w-[556px]">
            <ul className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <li>
                <span className="font-bold">Citizen Focus:</span>
                <br /> At AirQo, we believe that the main beneficiary of our
                work should be the citizen.
              </li>
              <li>
                <span className="font-bold">Precision:</span>
                <br /> We convert low-cost sensor data into a reliable measure
                of air quality thus making our network and our models as
                accurate as they can be.
              </li>
              <li>
                <span className="font-bold">Collaboration and Openness:</span>
                <br /> In order to maximize our impact, we collaborate by
                sharing our data through partnerships.
              </li>
              <li>
                <span className="font-bold">Investment in People:</span> We work
                in a fast-moving field with continuous improvements in
                technology. We recruit the best teams and also commit to their
                ongoing professional development and training.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Divider className="bg-black w-full p-0 h-[1px] mx-auto" />

      {/* Team Section */}
      {renderMembersSection(teamMembers, loadingTeam, 'team', 'Meet the team')}

      {/* External Team Section */}
      {renderMembersSection(
        externalTeamMembers,
        loadingExternalTeam,
        'external-team',
        'External team',
      )}

      {/* Board Section */}
      {renderMembersSection(
        boardMembers,
        loadingBoard,
        'board',
        'Meet the Board',
      )}

      {/* Partners Section */}
      {partners && (
        <section
          id="partners"
          className="max-w-5xl mx-auto w-full px-4 lg:px-0 space-y-8 scroll-mt-[200px]"
        >
          <div className="flex flex-col lg:flex-row items-start lg:space-x-12">
            {/* Title */}
            <h2 className="text-3xl lg:text-[48px] font-medium flex-shrink-0 w-full text-left lg:w-1/3">
              Our <br />
              partners
            </h2>

            {/* Content */}
            <div className="space-y-6 w-full max-w-[556px]">
              <p>
                Together with our partners, we are solving large, complex air
                quality monitoring challenges across Africa. We are providing
                much-needed air quality data to Governments and individuals in
                the continent to facilitate policy changes that combat air
                pollution.
              </p>
              <CustomButton
                onClick={() => dispatch(openModal())}
                className="bg-transparent p-0 m-0 flex items-center text-blue-700"
              >
                <span>Partner with Us </span>
                <FaArrowRightLong className="inline-block ml-2 " />
              </CustomButton>
            </div>
          </div>
          <PaginatedSection
            logos={partners.map((partner: any) => ({
              id: partner.id,
              logoUrl: partner.partner_logo_url || '',
            }))}
          />
        </section>
      )}
    </div>
  );
};

export default AboutPage;
