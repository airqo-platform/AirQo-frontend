import React from 'react';
import { useDispatch } from 'react-redux';
import Button from '@/components/Button';
import CountryList from './CountryList';
import SectionDivider from './SectionDivider';
import { setLocation } from '@/lib/store/services/map/MapSlice';

const CountryFilter = ({
  countryData,
  selectedCountry,
  setSelectedCountry,
  siteDetails = [],
  isLoading,
}) => {
  const dispatch = useDispatch();

  const handleAllClick = React.useCallback(() => {
    setSelectedCountry(null);
    dispatch(setLocation({ country: '', city: '' }));
  }, [dispatch, setSelectedCountry]);

  return (
    <>
      <div className="flex pl-3 pt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 hide-scrollbar">
        <Button
          onClick={handleAllClick}
          className={`px-3 border-none text-md font-medium h-10 flex items-center rounded-full transition-colors`}
        >
          All
        </Button>

        <CountryList
          data={countryData}
          isLoading={isLoading}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          siteDetails={siteDetails}
        />
      </div>
      <SectionDivider />
    </>
  );
};
export default React.memo(CountryFilter);
