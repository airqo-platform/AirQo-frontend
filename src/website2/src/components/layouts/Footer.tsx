import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

import mainConfig from '@/configs/mainConfigs';
import { Link } from '@/navigation';

import CountrySelectorDialog from '../sections/footer/CountrySelectorDialog';
import MonitorDisplay from '../sections/footer/MonitorDisplay';
import ScrollToTopButton from './ScrollToTopButton';

const Footer = () => {
  const t = useTranslations('footer');
  const adminUrl = `${process.env.NEXT_PUBLIC_API_URL}/website`;

  return (
    <footer
      id="WebsiteFooter"
      className={`relative py-8 px-4 ${mainConfig.containerClass} text-[14px]`}
    >
      <ScrollToTopButton />
      {/* Top Section with Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Logo and Social Media */}
        <div className="flex flex-col space-y-4">
          <div>
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png"
              alt="AirQo"
              width={70}
              height={60}
            />
            <h1 className="text-gray-700 font-semibold mt-4">{t('tagline')}</h1>
          </div>
          <div className="flex space-x-4 mt-6">
            <Link
              href="https://www.facebook.com/AirQo"
              aria-label={t('socialLinks.facebook')}
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
            >
              <FaFacebookF size={14} />
            </Link>
            <Link
              href="https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ"
              aria-label={t('socialLinks.youtube')}
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
            >
              <FaYoutube size={14} />
            </Link>
            <Link
              href="https://www.linkedin.com/company/airqo/mycompany/"
              aria-label={t('socialLinks.linkedin')}
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
            >
              <FaLinkedinIn size={14} />
            </Link>
            <Link
              href="https://x.com/AirQoProject"
              target="_blank"
              aria-label={t('socialLinks.twitter')}
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
            >
              <FaXTwitter size={14} />
            </Link>
          </div>
        </div>

        {/* Links Section */}
        <div className="flex justify-between flex-wrap gap-8">
          {/* Products Section */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-4">
              {t('sections.products.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products/monitor"
                  className="text-gray-600 hover:underline"
                >
                  {t('sections.products.binosMonitor')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products/analytics"
                  className="text-gray-600 hover:underline"
                >
                  {t('sections.products.analyticsDashboard')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products/api"
                  className="text-gray-600 hover:underline"
                >
                  {t('sections.products.airQualityAPI')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products/mobile-app"
                  className="text-gray-600 hover:underline"
                >
                  {t('sections.products.mobileApp')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products/calibrate"
                  className="text-gray-600 hover:underline"
                >
                  {t('sections.products.airQalibrate')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions Section */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-4">
              {t('sections.solutions.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/solutions/african-cities"
                  className="text-gray-600 hover:underline"
                >
                  {t('sections.solutions.forAfricanCities')}
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/communities"
                  className="text-gray-600 hover:underline"
                >
                  {t('sections.solutions.forCommunities')}
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/research"
                  className="text-gray-600 hover:underline"
                >
                  {t('sections.solutions.forResearch')}
                </Link>
              </li>
            </ul>
          </div>

          {/* About Section */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-4">
              {t('sections.about.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about-us"
                  className="text-gray-600 hover:underline"
                >
                  {t('sections.about.aboutAirQo')}
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-gray-600 hover:underline"
                >
                  {t('sections.about.resources')}
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-600 hover:underline">
                  {t('sections.about.events')}
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-600 hover:underline">
                  {t('sections.about.press')}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:underline">
                  {t('sections.about.careers')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:underline">
                  {t('sections.about.contactUs')}
                </Link>
              </li>
              <li>
                <Link
                  href="https://blog.airqo.net/"
                  target="_blank"
                  className="text-gray-600 hover:underline"
                >
                  {t('sections.about.blog')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 my-8"></div>

      {/* Bottom Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between items-center space-y-4 lg:space-y-0">
        {/* Location Button with Dialog */}
        <CountrySelectorDialog />

        {/* Monitors in Uganda */}
        <MonitorDisplay />
      </div>

      <div className="border-t border-gray-200 my-8"></div>

      {/* Footer Bottom Section */}
      <div className="flex flex-col text-sm lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        {/* Footer Bottom Links */}
        <div className="flex flex-wrap gap-4 text-center lg:text-left text-gray-600">
          &copy; {new Date().getFullYear()} AirQo
          <Link href="/legal/terms-of-service" className="hover:underline">
            {t('legal.termsOfService')}
          </Link>
          <Link href="/legal/privacy-policy" className="hover:underline">
            {t('legal.privacyPolicy')}
          </Link>
          <Link href="/legal/airqo-data" className="hover:underline">
            {t('legal.airQoData')}
          </Link>
          <Link href="/legal/payment-refund-policy" className="hover:underline">
            {t('legal.paymentTerms')}
          </Link>
          <a
            href={adminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {t('legal.adminPortal')}
          </a>
        </div>

        {/* Makerere University Attribution */}
        <div className="flex flex-col items-center lg:items-start">
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728142537/website/Logos/MakName_xmsi0k.png"
            alt={t('makerereUniversity')}
            width={237}
            height={38}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
