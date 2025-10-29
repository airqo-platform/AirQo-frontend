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
  const { data: africanCountries } = useAfricanCountries();

  const [selectedCountry, setSelectedCountry] = useState<AfricanCountry | null>(
    null,
  );
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Fetch country details when a country is selected
  const { data: countryDetail } = useAfricanCountryDetail(
    selectedCountry?.id || null,
  );

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

  if (!africanCountries || africanCountries.length === 0) return null;

  return (
    <div className={`${mainConfig.containerClass} p-4 lg:p-0`}>
      {/* Top Section: Countries List */}
      <div className="flex gap-4 flex-wrap pb-4">
        {africanCountries.map((country: AfricanCountry) => (
          <button
            key={country.id}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
              selectedCountry?.id === country.id
                ? 'border-blue-600 bg-blue-100'
                : 'border-gray-300'
            }`}
            onClick={() => handleCountrySelect(country)}
          >
            <Image
              src={country.country_flag_url}
              alt={country.country_name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="font-medium">{country.country_name}</span>
          </button>
        ))}
      </div>

      {/* Middle Section: Cities List for the selected country */}
      {countryDetail && countryDetail.city && countryDetail.city.length > 0 && (
        <div className="mt-6 border-t border-gray-300 w-full pt-4 pb-8">
          <div className="flex space-x-4">
            {countryDetail.city.map((city: City) => (
              <button
                key={city.id}
                className={`px-4 py-2 rounded-full border ${
                  selectedCity?.id === city.id
                    ? 'border-blue-600 bg-blue-100'
                    : 'border-gray-300'
                }`}
                onClick={() => handleCitySelect(city)}
              >
                {city.city_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section: City Details */}
      {selectedCity && selectedCity.content.length > 0 && (
        <div className="mt-8 relative grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section: Descriptions */}
          <div>
            <h2 className="text-3xl font-bold mb-4">
              {selectedCity.content[0].title}
            </h2>
            <div className="space-y-4">
              {selectedCity.content[0].description.map((desc) => (
                <p key={desc.id} className="text-lg text-gray-700">
                  {desc.paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Right Section: Responsive Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedCity.content[0].image.map((img, index: number) => (
              // On mobile, only show the first image; on sm and above, show all images.
              <div
                key={img.id}
                className={`${
                  index > 0 ? 'hidden sm:flex' : 'flex'
                } items-center justify-center w-full h-64`}
              >
                <Image
                  src={img.image_url}
                  alt={`City Image ${img.id}`}
                  width={500}
                  height={500}
                  className="rounded-lg shadow-md object-cover w-full h-full transition-transform duration-500 ease-in-out transform hover:scale-110 cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Overlay Blob Image */}
          <div className="absolute top-12 lg:top-20 -z-40 right-0 max-w-[500px] max-h-[300px] lg:max-w-[630px] lg:max-h-[400px] flex items-center justify-center">
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/about_us_vector_3_p0mihk.png"
              alt="Blob Overlay"
              width={510}
              height={360}
              className="object-cover rounded-lg w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AfricanCities;
