'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { IoLocationSharp } from 'react-icons/io5';

import {
  CustomButton,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Pagination,
} from '@/components/ui';
import { useDispatch } from '@/hooks';
import { getGridsSummary } from '@/services/externalService';
import { setSelectedCountry } from '@/store/slices/countrySlice';

interface AirqloudCountry {
  _id: string;
  name: string;
  long_name: string;
  numberOfSites: number;
  flag?: string;
}

const CountrySelectorDialog: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedCountryData, setSelectedCountryData] =
    useState<AirqloudCountry | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [airqloudData, setAirqloudData] = useState<AirqloudCountry[]>([]);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const itemsPerPage = 6;

  // Calculate total pages
  const totalPages = useMemo(
    () => Math.ceil(airqloudData.length / itemsPerPage),
    [airqloudData.length],
  );

  // Cache for flags to avoid redundant fetches
  const flagCache = useMemo(() => new Map<string, string>(), []);

  // Function to fetch the flag based on the country's long name with caching
  const fetchFlag = useCallback(
    async (countryName: string, abortSignal: AbortSignal) => {
      if (flagCache.has(countryName)) {
        return flagCache.get(countryName)!;
      }
      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName.replace('_', ' '))}`,
          { signal: abortSignal },
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch flag for ${countryName}`);
        }
        const data = await response.json();
        const flag = data[0]?.flags?.png || '';
        flagCache.set(countryName, flag);
        return flag;
      } catch (error) {
        console.error('Error fetching flag for country:', countryName, error);
        return '';
      }
    },
    [flagCache],
  );

  // Fetch airqloud summary using the proxy route or production service
  const fetchAirqloudSummary = useCallback(
    async (abortSignal: AbortSignal) => {
      try {
        let data;
        if (process.env.NODE_ENV === 'development') {
          const response = await fetch(
            `/api/proxy?endpoint=devices/grids/summary`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              signal: abortSignal,
            },
          );
          if (!response.ok) throw new Error(`Error: ${response.statusText}`);
          data = await response.json();
        } else {
          data = await getGridsSummary();
        }
        // Filter data to only include grids where admin_level is "country"
        const countryLevelData: AirqloudCountry[] = data.grids.filter(
          (grid: any) => grid.admin_level === 'country',
        );
        // Dynamically fetch flags
        const countriesWithFlags = await Promise.all(
          countryLevelData.map(async (country: AirqloudCountry) => {
            const flag = await fetchFlag(country.long_name, abortSignal);
            return { ...country, flag };
          }),
        );
        setAirqloudData(countriesWithFlags);
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          console.error('Error fetching airqloud summary:', error);
        }
      }
    },
    [fetchFlag],
  );

  // Helper: Wrap the geolocation API in a promise
  const getCurrentPositionAsync = (
    options: PositionOptions = {},
  ): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      }
    });
  };

  // Function to get the user's country based on coordinates using reverse geocoding
  const fetchUserCountry = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`,
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch user country: ${response.statusText}`,
          );
        }
        const data = await response.json();
        const country = data.results[0]?.components?.country || null;
        setUserCountry(country);
      } catch (error) {
        console.error('Error fetching user country:', error);
        setUserCountry(null);
      }
    },
    [],
  );

  // Helper to format and truncate long country names
  const formatCountryName = useCallback((name: string) => {
    const cleanName = name.replace(/_/g, ' ');
    return cleanName.length > 20 ? `${cleanName.slice(0, 20)}...` : cleanName;
  }, []);

  // Effect: Get the user's coordinates and fetch the corresponding country
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const position = await getCurrentPositionAsync({ timeout: 10000 });
        if (isMounted) {
          const { latitude, longitude } = position.coords;
          fetchUserCountry(latitude, longitude);
        }
      } catch (error) {
        console.error('Error getting location:', error);
        if (isMounted) {
          setUserCountry(null);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [fetchUserCountry]);

  // Effect: Fetch airqloud data
  useEffect(() => {
    const controller = new AbortController();
    fetchAirqloudSummary(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchAirqloudSummary]);

  // Effect: Set the default selected country once data is loaded
  useEffect(() => {
    if (airqloudData.length > 0) {
      let defaultCountry: AirqloudCountry | null = null;
      if (userCountry) {
        defaultCountry =
          airqloudData.find(
            (country) =>
              country.long_name.toLowerCase() === userCountry.toLowerCase(),
          ) || null;
      }
      if (!defaultCountry) {
        defaultCountry =
          airqloudData.find(
            (country) => country.long_name.toLowerCase() === 'uganda',
          ) || null;
      }
      defaultCountry = defaultCountry || airqloudData[0];
      setSelectedCountryData(defaultCountry);
      dispatch(setSelectedCountry(defaultCountry));
    }
  }, [airqloudData, userCountry, dispatch]);

  const handleSave = useCallback(() => {
    if (selectedCountryData) {
      dispatch(setSelectedCountry(selectedCountryData));
    }
    setIsOpen(false);
  }, [dispatch, selectedCountryData]);

  // Pagination logic for displaying countries on the current page
  const paginatedCountries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return airqloudData.slice(startIndex, startIndex + itemsPerPage);
  }, [airqloudData, currentPage]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl text-gray-800 hover:bg-gray-200 transition-all">
          <IoLocationSharp size={20} color="#2563eb" />
          <span>
            {selectedCountryData?.long_name.replace('_', ' ') ||
              'Select Country'}
          </span>
          <FiChevronDown size={16} className="text-gray-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col h-full w-full overflow-hidden">
        <DialogHeader className="border-b flex justify-center px-4 py-6 w-full h-[40px] border-gray-300">
          <DialogTitle className="text-xl">Country AirQloud</DialogTitle>
        </DialogHeader>

        <div className="flex-grow flex flex-col overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4"
          >
            <h1 className="text-gray-700 text-4xl font-bold">
              Our growing network in Africa
            </h1>
            <p className="text-xl mt-2">
              View AirQo developments in your country
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-5 p-4 overflow-y-auto"
          >
            {airqloudData.length > 0 ? (
              <>
                <h3 className="text-lg font-semibold">Selected Country</h3>
                <div className="flex items-center space-x-2">
                  {selectedCountryData?.flag && (
                    <Image
                      src={selectedCountryData.flag}
                      alt={selectedCountryData.long_name}
                      width={48}
                      height={36}
                      className="rounded-md"
                    />
                  )}
                  <span>
                    {selectedCountryData?.long_name.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-semibold">Select Country</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {paginatedCountries.map((country) => (
                    <motion.button
                      key={country._id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center justify-start space-x-2 p-2 rounded-lg border w-full h-[60px] ${
                        selectedCountryData?.name === country.name
                          ? 'bg-blue-100 border-blue-600'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                      onClick={() => setSelectedCountryData(country)}
                    >
                      {country.flag && (
                        <Image
                          src={country.flag}
                          alt={country.long_name}
                          width={30}
                          height={24}
                          className="rounded-md"
                        />
                      )}
                      <span title={country.long_name}>
                        {formatCountryName(country.long_name)}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-2">
                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg text-gray-600">
                  No countries available at the moment.
                </p>
                <p className="text-gray-500">Please try again later.</p>
              </div>
            )}
          </motion.div>
        </div>

        <DialogFooter className="mt-6 flex flex-row justify-end items-center p-4 w-full border-t border-gray-300 gap-4">
          <CustomButton
            className="text-gray-600 h-[40px] p-3 text-center flex justify-center items-center border bg-transparent border-gray-300 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </CustomButton>
          <CustomButton
            className="text-white h-[40px] p-3 text-center flex justify-center items-center"
            onClick={handleSave}
          >
            Save
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CountrySelectorDialog;
