import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AqDotsGrid,
  AqCalibration,
  AqBarChartSquarePlus,
  AqGlobe02Maps_Travel,
  AqBookOpen01,
  AqPhone01,
  AqArrowNarrowLeft,
  AqCpuChip01,
  AqServer03,
} from '@airqo/icons-react';
import { FaGooglePlay, FaApple } from 'react-icons/fa';
import CardWrapper from '@/common/components/CardWrapper';

const AppDropdown = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const dropdownRef = useRef(null);
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowQRCode(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUrl = (baseUrl) => {
    if (isProduction) return baseUrl;
    try {
      const url = new URL(baseUrl);
      url.hostname = `staging-${url.hostname}`;
      return url.toString();
    } catch {
      return baseUrl;
    }
  };

  const apps = [
    {
      name: 'Calibrate',
      icon: AqCalibration,
      href: getUrl('https://airqalibrate.airqo.net/'),
      color: 'bg-blue-500',
    },
    {
      name: 'Analytics',
      icon: AqBarChartSquarePlus,
      href: getUrl('https://analytics.airqo.net/'),
      color: 'bg-green-500',
    },
    {
      name: 'Website',
      icon: AqGlobe02Maps_Travel,
      href: 'https://airqo.net/',
      color: 'bg-purple-500',
    },
    {
      name: 'Vertex',
      icon: AqServer03,
      href: getUrl('https://vertex.airqo.net/'),
      color: 'bg-yellow-500',
    },
    {
      name: 'API Docs',
      icon: AqBookOpen01,
      href: 'https://docs.airqo.net/airqo-rest-api-documentation/',
      color: 'bg-orange-500',
    },
    {
      name: 'Mobile App',
      icon: AqPhone01,
      type: 'qr',
      color: 'bg-indigo-500',
    },
    {
      name: 'AI platform',
      icon: AqCpuChip01,
      href: 'https://ai.airqo.net',
      color: 'bg-pink-500',
    },
  ];

  const handleAppClick = (app) => {
    if (app.type === 'qr') setShowQRCode(true);
    else {
      window.open(app.href, '_blank', 'noopener,noreferrer');
      setIsOpen(false);
    }
  };

  const closeModal = () => {
    setShowQRCode(false);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`p-2 rounded-full transition ${isOpen ? 'bg-gray-100 shadow' : 'hover:bg-gray-100'}`}
        aria-label="Applications"
      >
        <AqDotsGrid className="w-6 h-6 text-gray-600" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-20 z-40"
              onClick={closeModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="absolute right-4 top-12 w-96 z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CardWrapper padding="p-0" className="shadow-xl overflow-hidden">
                {!showQRCode ? (
                  <motion.div
                    className="p-6 grid grid-cols-3 gap-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {apps.map((app) => {
                      const Icon = app.icon;
                      return (
                        <button
                          key={app.name}
                          type="button"
                          title={app.name}
                          onClick={() => handleAppClick(app)}
                          className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 focus:outline-none h-28"
                          aria-label={app.name}
                        >
                          <div
                            className={`w-14 h-14 ${app.color} rounded-lg flex items-center justify-center shadow-md`}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <span className="mt-2 text-sm font-medium text-gray-700 text-center whitespace-nowrap truncate max-w-[72px]">
                            {app.name}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    className="p-6"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={() => setShowQRCode(false)}
                        className="p-2 rounded-full hover:bg-gray-100"
                        aria-label="Back"
                      >
                        <AqArrowNarrowLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Get AirQo Mobile App
                      </h3>
                      <span></span>
                    </div>
                    <div className="flex justify-center mb-6">
                      <div className="w-56 h-56 bg-white rounded-2xl border-2 border-blue-300 shadow-sm overflow-hidden">
                        <img
                          src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132437/website/photos/QR_code_ysf0ca.jpg"
                          alt="AirQo Mobile App QR Code"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <p className="text-center text-base font-medium text-gray-800 mb-2">
                      Scan with your phone camera
                    </p>
                    <p className="text-center text-sm text-gray-500 mb-6">
                      Or search &quot;AirQo&quot; in your app store
                    </p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() =>
                          window.open(
                            'https://play.google.com/store/apps/details?id=com.airqo.app',
                            '_blank',
                          )
                        }
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                      >
                        <FaGooglePlay className="mr-2" /> Google Play
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            'https://apps.apple.com/ug/app/airqo-air-quality/id1337573091',
                            '_blank',
                          )
                        }
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                      >
                        <FaApple className="mr-2" /> App Store
                      </button>
                    </div>
                  </motion.div>
                )}
              </CardWrapper>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppDropdown;
