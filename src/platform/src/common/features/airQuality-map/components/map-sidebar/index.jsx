import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import Card from '@/components/CardWrapper';
import SidebarHeader from './components/SidebarHeader';
import SearchField from '@/components/search/SearchField';
import CountryFilter from './components/CountryFilter';
import LocationCards from './components/LocationCards';
import DetailsView from './components/DetailsView';
import SearchView from './components/SearchView';
import LoadingSkeleton from './components/LoadingSkeleton';
import useAutocomplete from './hooks/useAutocomplete';
import useWeeklyPredictions from './hooks/useWeeklyPredictions';
import buildCountryData from './utils/buildCountryData';
import {
  setSelectedLocation,
  addSuggestedSites,
} from '@/lib/store/services/map/MapSlice';
import { useWindowSize } from '@/core/hooks/useWindowSize';

const MapSidebar = ({ siteDetails = [], isAdmin = false, children }) => {
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const [selectedCountry, setSelectedCountry] = useState(null);

  /* ------------- hooks ------------- */
  const {
    isSearchFocused,
    searchResults,
    isLoading: searchLoading,
    error,
    clearError,
    handleSearch,
    handleExit,
    handleLocationSelect,
    setIsFocused,
  } = useAutocomplete(siteDetails);

  const selectedLocation = useSelector((s) => s.map.selectedLocation);
  const mapLoading = useSelector((s) => s.map.mapLoading);
  const selectedWeekly = useSelector((s) => s.map.selectedWeeklyPrediction);
  const suggestedSites = useSelector((s) => s.map.suggestedSites);

  const { weeklyPredictions, isLoading: predictionsLoading } =
    useWeeklyPredictions(selectedLocation);

  /* ------------- derived ------------- */
  const countryData = useMemo(
    () => buildCountryData(siteDetails),
    [siteDetails],
  );

  /* show initial pre-sorted list (original behaviour) */
  useEffect(() => {
    if (siteDetails.length) {
      const sorted = [...siteDetails].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      dispatch(addSuggestedSites(sorted));
    }
  }, [dispatch, siteDetails]);

  const displaySites = useMemo(() => {
    if (!siteDetails.length) return [];
    return selectedCountry
      ? siteDetails.filter((s) => s.country === selectedCountry)
      : suggestedSites;
  }, [selectedCountry, siteDetails, suggestedSites]);

  const closeDetails = () => dispatch(setSelectedLocation(null));

  return (
    <Card
      className="relative w-full h-full text-left"
      rounded={false}
      padding="p-0"
      overflow
    >
      <div className="h-full flex flex-col">
        {/* HEADER + FILTERS */}
        {!isSearchFocused && !selectedLocation && (
          <>
            <SidebarHeader isAdmin={isAdmin} />
            {!isAdmin && <hr className="my-2" />}
            <div className="px-3" onClick={() => setIsFocused(true)}>
              <SearchField showSearchResultsNumber={false} focus={false} />
            </div>
            <CountryFilter
              countryData={countryData}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              onAll={() => {
                setSelectedCountry(null);
              }}
              siteDetails={siteDetails}
            />
          </>
        )}

        {children && <div className="px-3 py-2">{children}</div>}

        <div
          style={{ paddingBottom: width > 1024 ? 0 : 100 }}
          className="flex-1 overflow-y-auto"
        >
          {/* Details view */}
          {selectedLocation && !mapLoading && (
            <DetailsView
              location={selectedLocation}
              weeklyPredictions={weeklyPredictions}
              loading={predictionsLoading}
              onBack={closeDetails}
              selectedWeeklyPrediction={selectedWeekly}
            />
          )}
          {/* Search results */}
          {isSearchFocused && (
            <SearchView
              searchResults={searchResults}
              loading={searchLoading}
              error={error}
              clearError={clearError}
              onExit={handleExit}
              onSearch={handleSearch}
              onSelect={handleLocationSelect}
              isAdmin={isAdmin}
            />
          )}
          {/* Loading */}
          {!selectedLocation && !isSearchFocused && !siteDetails.length && (
            <LoadingSkeleton />
          )}
          {/* Empty */}
          {!selectedLocation &&
          !isSearchFocused &&
          !displaySites.length &&
          siteDetails.length ? (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
              No locations available
            </p>
          ) : null}
          {/* Sites list */}
          {!selectedLocation && !isSearchFocused && displaySites.length > 0 && (
            <LocationCards
              searchResults={displaySites}
              isLoading={false}
              handleLocationSelect={(data) =>
                handleLocationSelect(data, 'suggested')
              }
            />
          )}
        </div>
      </div>
    </Card>
  );
};

MapSidebar.propTypes = {
  siteDetails: PropTypes.arrayOf(PropTypes.object),
  isAdmin: PropTypes.bool,
  children: PropTypes.node,
};

export default MapSidebar;
