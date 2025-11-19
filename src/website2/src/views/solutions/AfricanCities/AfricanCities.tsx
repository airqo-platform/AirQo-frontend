import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import mainConfig from '@/configs/mainConfigs';
import {
  useAfricanCountries,
  useAfricanCountryDetail,
} from '@/hooks/useApiHooks';
import type { AfricanCountry, City } from '@/services/types/api';

const AfricanCities: React.FC = () => {
  // Get all African countries
  const { data: africanCountries, isLoading: countriesLoading } =
    useAfricanCountries();

  const [selectedCountry, setSelectedCountry] = useState<AfricanCountry | null>(
    null,
  );
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Fetch country details when a country is selected
  const { data: countryDetail, isLoading: _countryDetailLoading } =
    useAfricanCountryDetail(selectedCountry?.id || null);

  // Set default country when data loads
  useEffect(() => {
    // Only set a default country if the user hasn't selected one yet.
    if (!selectedCountry && africanCountries && africanCountries.length > 0) {
      const defaultCountry = africanCountries[0];
      setSelectedCountry(defaultCountry);
    }
  }, [africanCountries, selectedCountry]);

  // Set default city when country detail loads
  useEffect(() => {
    if (countryDetail && countryDetail.city && countryDetail.city.length > 0) {
      setSelectedCity(countryDetail.city[0]);
    } else {
      setSelectedCity(null);
    }
  }, [countryDetail]);

  // Handle country selection
  const handleCountrySelect = (country: AfricanCountry) => {
    setSelectedCountry(country);
    setSelectedCity(null); // Reset city selection when country changes
  };

  // Handle city selection
  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
  };

  // Skeleton Components
  const CountrySkeleton = () => (
    <div className="flex flex-wrap gap-3 md:gap-4 justify-center lg:justify-start">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 animate-pulse"
        >
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 rounded w-16 sm:w-20"></div>
        </div>
      ))}
    </div>
  );

  const CitySkeleton = () => (
    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="px-4 py-2 rounded-full border border-gray-200 bg-gray-50 animate-pulse"
        >
          <div className="h-4 bg-gray-300 rounded w-12 sm:w-16"></div>
        </div>
      ))}
    </div>
  );

  const ContentSkeleton = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
      {/* Left Section: Content Skeleton */}
      <div className="xl:col-span-7 space-y-6">
        <div>
          <div className="h-8 md:h-10 lg:h-12 bg-gray-300 rounded mb-6 animate-pulse w-3/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-4 lg:h-5 bg-gray-300 rounded animate-pulse"
                style={{ width: `${85 + Math.random() * 15}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section: Images Skeleton */}
      <div className="xl:col-span-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 xl:gap-6">
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl shadow-lg ${
                index === 0 ? 'sm:col-span-2 xl:col-span-1' : ''
              }`}
            >
              <div className="aspect-[4/3] xl:aspect-[3/2] relative bg-gray-300 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Loading state for initial countries load
  if (countriesLoading) {
    return (
      <div
        className={`${mainConfig.containerClass} px-4 py-6 lg:px-8 lg:py-12`}
      >
        <div className="mb-8">
          <CountrySkeleton />
        </div>
        <div className="mb-12 border-t border-gray-200 pt-8">
          <CitySkeleton />
        </div>
        <div className="relative">
          <ContentSkeleton />
        </div>
      </div>
    );
  }

  if (!africanCountries || africanCountries.length === 0) return null;

  return (
    <div className={`${mainConfig.containerClass} px-4 py-6 lg:px-8 lg:py-12`}>
      {/* Top Section: Countries List */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 md:gap-4 justify-center lg:justify-start">
          {africanCountries.map((country: AfricanCountry) => (
            <button
              key={country.id}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-full border transition-all duration-300 hover:shadow-md ${
                selectedCountry?.id === country.id
                  ? 'border-blue-600 bg-blue-100 shadow-md'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
              onClick={() => handleCountrySelect(country)}
            >
              <Image
                src={country.country_flag_url}
                alt={country.country_name}
                width={24}
                height={24}
                className="rounded-full w-6 h-6 object-cover"
              />
              <span className="font-medium text-sm md:text-base">
                {country.country_name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Middle Section: Cities List for the selected country */}
      {selectedCountry && (
        <div className="mb-12 border-t border-gray-200 pt-8">
          {_countryDetailLoading ? (
            <CitySkeleton />
          ) : countryDetail &&
            countryDetail.city &&
            countryDetail.city.length > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {countryDetail.city.map((city: City) => (
                <button
                  key={city.id}
                  className={`px-4 py-2 rounded-full border text-sm md:text-base font-medium transition-all duration-300 hover:shadow-md ${
                    selectedCity?.id === city.id
                      ? 'border-blue-600 bg-blue-100 shadow-md'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                  onClick={() => handleCitySelect(city)}
                >
                  {city.city_name}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No cities available for this country
            </div>
          )}
        </div>
      )}

      {/* Bottom Section: City Details */}
      {selectedCountry && (
        <div className="relative">
          {_countryDetailLoading || !selectedCity ? (
            <ContentSkeleton />
          ) : selectedCity.content.length > 0 ? (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Section: Content */}
                <div className="xl:col-span-7 space-y-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
                      {selectedCity.content[0].title}
                    </h2>
                    <div className="space-y-4">
                      {selectedCity.content[0].description.map((desc) => (
                        <p
                          key={desc.id}
                          className="text-base lg:text-lg text-gray-700 leading-relaxed"
                        >
                          {desc.paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Section: Images */}
                <div className="xl:col-span-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 xl:gap-6">
                    {selectedCity.content[0].image.map((img, index: number) => (
                      <div
                        key={img.id}
                        className={`relative group overflow-hidden rounded-xl shadow-lg ${
                          index > 1 ? 'hidden sm:block xl:hidden' : ''
                        } ${index === 0 ? 'sm:col-span-2 xl:col-span-1' : ''}`}
                      >
                        <div className="aspect-[4/3] xl:aspect-[3/2] relative">
                          <Image
                            src={img.image_url}
                            alt={`${selectedCity.city_name} - Image ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 40vw"
                            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show remaining images in a grid for mobile when there are more than 2 */}
                  {selectedCity.content[0].image.length > 2 && (
                    <div className="sm:hidden mt-4 grid grid-cols-2 gap-2">
                      {selectedCity.content[0].image
                        .slice(1, 3)
                        .map((img, index: number) => (
                          <div
                            key={`mobile-${img.id}`}
                            className="relative group overflow-hidden rounded-lg shadow-md"
                          >
                            <div className="aspect-square relative">
                              <Image
                                src={img.image_url}
                                alt={`${selectedCity.city_name} - Image ${index + 2}`}
                                fill
                                sizes="50vw"
                                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative Background Blob - Hidden on mobile for better performance */}
              <div className="hidden lg:block absolute top-0 right-0 -z-10 w-[500px] h-[400px] xl:w-[600px] xl:h-[480px] opacity-10">
                <Image
                  src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/about_us_vector_3_p0mihk.png"
                  alt=""
                  fill
                  className="object-cover"
                  priority={false}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No content available for this city
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AfricanCities;
