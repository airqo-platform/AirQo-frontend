import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedLocations,
  getSitesSummary,
  setGridsSummary,
} from '@/lib/store/services/deviceRegistry/GridsSlice';
import LocationIcon from '@/icons/SideBar/Sites.svg';
import TrashIcon from '@/icons/Actions/bin_icon.svg';
import StarIcon from '@/icons/Actions/star_icon.svg';
import StarIconLight from '@/icons/Actions/star_icon_light.svg';
import DragIcon from '@/icons/Actions/drag_icon.svg';
import DragIconLight from '@/icons/Actions/drag_icon_light.svg';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Spinner from '@/components/Spinner';
import AlertBox from '@/components/AlertBox';
import useOutsideClick from '@/core/utils/useOutsideClick';
import SearchField from '@/components/search/SearchField';
import { getNearestSite, getGridsSummaryApi } from '@/core/apis/DeviceRegistry';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';
import { capitalizeAllText } from '@/core/utils/strings';
import { getPlaceDetails } from '@/core/utils/getLocationGeomtry';
import { getAutocompleteSuggestions } from '@/core/utils/AutocompleteSuggestions';

const SearchResultsSkeleton = () => (
  <div className="flex flex-col gap-1 animate-pulse">
    <div className="bg-secondary-neutral-dark-50 rounded-xl w-full h-6" />
    <div className="bg-secondary-neutral-dark-50 rounded-xl w-full h-6" />
    <div className="bg-secondary-neutral-dark-50 rounded-xl w-full h-6" />
    <div className="bg-secondary-neutral-dark-50 rounded-xl w-full h-6" />
    <div className="bg-secondary-neutral-dark-50 rounded-xl w-full h-6" />
  </div>
);

/**
 * @param {Object} props
 * @returns {JSX.Element}
 * @description Renders the location item cards
 * and handles the location selection and removal
 * and reordering of the selected locations
 */
const LocationItemCards = ({
  location,
  handleLocationSelect,
  handleRemoveLocation,
  draggableProps,
  dragHandleProps,
  innerRef,
  showTrashIcon = false,
  showActiveStarIcon = true,
}) => {
  let locationName = location?.search_name || location?.name;
  let locationDescripton =
    location.location_name ||
    location?.search_name ||
    location?.name ||
    location?.long_name;

  return (
    <div
      className="border rounded-lg bg-secondary-neutral-light-25 border-input-light-outline flex flex-row justify-between items-center p-3 w-full mb-2"
      key={locationName}
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
    >
      <div
        className="flex flex-row items-center overflow-x-clip"
        title={capitalizeAllText(locationName)}
      >
        <div>{showActiveStarIcon ? <DragIcon /> : <DragIconLight />}</div>
        <span className="text-sm text-secondary-neutral-light-800 font-medium">
          {locationName?.split(',')[0].length > 20
            ? capitalizeAllText(locationName?.split(',')[0].substring(0, 15)) +
              '...'
            : capitalizeAllText(locationName?.split(',')[0])}
          {locationDescripton?.split(',').length > 1 && (
            <span className="text-grey-400">
              {locationDescripton?.split(',').pop()}
            </span>
          )}
        </span>
      </div>
      <div className="flex flex-row">
        {showTrashIcon && (
          <div
            className="mr-1 hover:cursor-pointer"
            onClick={() => handleRemoveLocation(location)}
          >
            <TrashIcon />
          </div>
        )}
        {showActiveStarIcon ? (
          <div
            className="bg-primary-600 rounded-md p-2 flex items-center justify-center hover:cursor-pointer"
            onClick={() => handleLocationSelect(location)}
          >
            <StarIcon />
          </div>
        ) : (
          <div
            className="border border-input-light-outline rounded-md p-2 flex items-center justify-center hover:cursor-pointer"
            onClick={() => handleLocationSelect(location)}
          >
            <StarIconLight />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * @param {Object} props
 * @returns {JSX.Element}
 * @description Renders the no suggestions message
 * when there are no suggestions or locations found
 */
const NoSuggestions = ({ message }) => (
  <div className="flex flex-row justify-center mt-[60px] items-center mb-0.5 text-sm w-full">
    <div className="text-sm ml-1 text-black font-medium capitalize">
      {message}
    </div>
  </div>
);

const LocationsContentComponent = ({
  selectedLocations,
  resetSearchData = false,
}) => {
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const sitesData = useSelector((state) => state.grids.sitesSummary);
  const sitesLocationsData = (sitesData && sitesData.sites) || [];
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isGettingNearestSite, setIsGettingNearestSite] = useState(false);
  const gridsSummaryData = useSelector((state) => state.grids.gridsSummary);
  const reduxSearchTerm = useSelector(
    (state) => state.locationSearch.searchTerm,
  );

  const [inputSelect, setInputSelect] = useState(false);
  const [locationArray, setLocationArray] = useState(selectedLocations);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [unSelectedLocations, setUnSelectedLocations] = useState([]);
  const [draggedLocations, setDraggedLocations] = useState(selectedLocations);
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [isFocused, setIsFocused] = useState(false);
  const [airqoCountries, setAirqoCountries] = useState([]);

  const autoCompleteSessionToken = useMemo(
    () => new google.maps.places.AutocompleteSessionToken(),
    [google.maps.places.AutocompleteSessionToken],
  );

  const focus = isFocused || reduxSearchTerm.length > 0;

  useEffect(() => {
    const fetchGridsData = async () => {
      if (gridsSummaryData && gridsSummaryData.length === 0) {
        try {
          const response = await getGridsSummaryApi();
          if (response && response.success) {
            dispatch(setGridsSummary(response.grids));
          }
        } catch (error) {
          console.error('Failed to get grids summary:', error);
        }
      }
    };
    fetchGridsData();
  }, []);

  useEffect(() => {
    if (gridsSummaryData && gridsSummaryData.length > 0) {
      // Check if selected grid admin_level is country
      const countryNames = gridsSummaryData
        .filter((grid) => grid.admin_level.toLowerCase() === 'country')
        .map((country) => country.name.toLowerCase());

      setAirqoCountries(countryNames);
    }
  }, [gridsSummaryData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (sitesLocationsData && sitesLocationsData.length < 1) {
          await dispatch(getSitesSummary());
        }
      } catch (error) {
        return;
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (sitesLocationsData && sitesLocationsData.length > 0) {
      try {
        dispatch(setSelectedLocations(locationArray));
        while (unSelectedLocations.length < 8) {
          const randomIndex = Math.floor(
            Math.random() * sitesLocationsData.length,
          );
          const randomObject = sitesLocationsData[randomIndex];
          if (
            !unSelectedLocations.find(
              (location) => location._id === randomObject._id,
            )
          ) {
            unSelectedLocations.push(randomObject);
          }
        }
      } catch (error) {
        return;
      }
    }
  }, [locationArray, sitesLocationsData]);

  /**
   * @param {Object} e
   * @returns {void}
   * @description Handles the location entry and filters the locations based on the search query
   */
  const handleLocationEntry = async () => {
    setInputSelect(false);
    setIsLoadingResults(true);
    if (reduxSearchTerm && reduxSearchTerm.length > 3) {
      try {
        // Create a new AutocompleteService instance
        const autocompleteSuggestions = await getAutocompleteSuggestions(
          reduxSearchTerm,
          autoCompleteSessionToken,
        );
        if (autocompleteSuggestions && autocompleteSuggestions.length > 0) {
          const filteredPredictions = autocompleteSuggestions.filter(
            (prediction) => {
              return airqoCountries.some((country) =>
                prediction.description
                  .toLowerCase()
                  .includes(country.toLowerCase()),
              );
            },
          );

          const locationPromises = filteredPredictions.map((prediction) => {
            return new Promise((resolve) => {
              // Resolve the promise with the location details
              resolve({
                description: prediction.description,
                place_id: prediction.place_id,
              });
            });
          });

          Promise.all(locationPromises)
            .then((locations) => {
              setFilteredLocations(locations);
              setIsLoadingResults(false);
            })
            .catch((error) => {
              setIsLoadingResults(false);
              throw new Error(error.message);
            });
        }
      } catch (error) {
        setIsError({
          isError: true,
          message: error.message,
          type: 'error',
        });
      } finally {
        setIsLoadingResults(false);
      }
    } else {
      setFilteredLocations([]);
    }
  };

  const resetSearch = () => {
    dispatch(addSearchTerm(''));
    setIsFocused(false);
    setFilteredLocations(unSelectedLocations);
  };

  /**
   * @param {Object} e
   * @returns {void}
   * @description hides the search dropdown when clicked outside the search dropdown
   * and resets the search input
   */
  useOutsideClick(searchRef, () => {
    dispatch(addSearchTerm(''));
    setFilteredLocations(unSelectedLocations);
    setInputSelect(!inputSelect);
  });

  /**
   * @param {Object} item
   * @returns {void}
   * @description Handles the selection of a location and adds it to the selected locations
   * array
   */
  const handleLocationSelect = async (item) => {
    setIsGettingNearestSite(true);
    dispatch(addSearchTerm(''));
    try {
      let newLocationValue;
      let newItemValue;
      if (item?.place_id) {
        try {
          const placeDetails = await getPlaceDetails(item.place_id);
          if (placeDetails) {
            newItemValue = { ...item, ...placeDetails };
          }
        } catch (error) {
          setIsGettingNearestSite(false);
          setIsError({
            isError: true,
            message: error.message,
            type: 'error',
          });
          return;
        }

        if (newItemValue?.latitude && newItemValue?.longitude) {
          try {
            const response = await getNearestSite({
              latitude: newItemValue?.latitude,
              longitude: newItemValue?.longitude,
              radius: 4,
            });

            if (response.sites && response.sites.length > 0) {
              newLocationValue = {
                ...response.sites[
                  Math.floor(Math.random() * response.sites.length)
                ],
                name: newItemValue?.description,
                long_name: newItemValue?.description,
                search_name: newItemValue?.description,
                location_name: newItemValue?.description,
              };
            } else {
              throw new Error(
                `Can't find air quality for ${
                  newItemValue?.description?.split(',')[0]
                }. Please try another location.`,
              );
            }
          } catch (error) {
            setIsError({
              isError: true,
              message: error.message,
              type: 'error',
            });
            return;
          }
        }
      } else {
        newLocationValue = { ...item, name: item?.search_name };
      }

      const newLocationArray = [...locationArray];
      const index = newLocationArray.findIndex(
        (location) => location.name === newLocationValue.name,
      );
      if (index !== -1) {
        setIsGettingNearestSite(false);
        setIsError({
          isError: true,
          message: 'Location already added',
          type: 'error',
        });
        return;
      } else if (newLocationArray.length < 4) {
        newLocationArray.push(newLocationValue);
        const unselectedIndex = unSelectedLocations.findIndex(
          (location) => location.name === newLocationValue.name,
        );
        unSelectedLocations.splice(unselectedIndex, 1);
      } else {
        setIsGettingNearestSite(false);
        setIsError({
          isError: true,
          message:
            'You have reached the limit of 4 locations. Please remove a location before adding another.',
          type: 'error',
        });
        return;
      }
      setLocationArray(newLocationArray);
      setDraggedLocations(newLocationArray);
      setInputSelect(true);
    } catch (error) {
      console.error('Failed to get nearest site:', error);
    } finally {
      setIsGettingNearestSite(false);
    }
  };

  /**
   * @param {Object} item
   * @returns {void}
   * @description Removes a location from the selected locations array
   * and adds it back to the unselected locations array
   * and updates the selected locations array in the redux store
   * and updates the dragged locations array
   * and updates the unselected locations array
   */
  const removeLocation = (item) => {
    const newLocationSet = new Set(
      locationArray.map((location) => location.name),
    );
    newLocationSet.delete(item.name);
    const newLocationArray = Array.from(newLocationSet, (name) =>
      locationArray.find((location) => location.name === name),
    );
    setLocationArray(newLocationArray);
    setDraggedLocations(newLocationArray);
    setUnSelectedLocations((locations) =>
      locations.filter((location) => location.name !== item.name),
    );
    dispatch(setSelectedLocations(newLocationArray));
  };

  /**
   * @param {Object} result
   * @returns {void}
   * @description Reorders the selected locations array based on the drag and drop
   * and updates the dragged locations array
   */
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(draggedLocations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDraggedLocations(items);
  };

  useEffect(() => {
    if (reduxSearchTerm !== '') {
      setIsLoadingResults(true);
    }
  }, [reduxSearchTerm]);

  useEffect(() => {
    if (resetSearchData) {
      resetSearch();
    }
  }, [resetSearchData]);

  useEffect(() => {
    resetSearch();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-row mt-[100px] justify-center items-center">
        <Spinner data-testid="spinner" width={25} height={25} />
      </div>
    );
  }

  return (
    <div>
      <div className="mt-6">
        <SearchField
          onSearch={handleLocationEntry}
          onClearSearch={resetSearch}
          focus={focus}
          showSearchResultsNumber={false}
        />
        {reduxSearchTerm !== '' && (
          <div
            ref={searchRef}
            className={`bg-white max-h-48 overflow-y-scroll px-3 pt-2 pr-1 my-1 border border-input-light-outline rounded-md ${
              inputSelect ? 'hidden' : 'relative'
            }`}
          >
            {isLoadingResults ? (
              <SearchResultsSkeleton />
            ) : filteredLocations && filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <div
                  className="flex items-center mb-0.5 hover:cursor-pointer gap-2"
                  onClick={() => {
                    handleLocationSelect(location);
                  }}
                  key={location.place_id}
                >
                  <LocationIcon />
                  <div className="text-sm text-black capitalize text-nowrap w-56 md:w-96 lg:w-72 overflow-hidden text-ellipsis">
                    {location?.description?.split(',')[0].length > 35
                      ? location?.description?.split(',')[0].substring(0, 35) +
                        '...'
                      : location?.description?.split(',')[0]}
                    {location?.description?.split(',').length > 1 && (
                      <span className="text-grey-400">
                        {location?.description?.split(',').slice(1).join(',')
                          .length > 35
                          ? `${location?.description
                              ?.split(',')
                              .slice(1)
                              .join(',')
                              .substring(0, 35)}...`
                          : location?.description
                              ?.split(',')
                              .slice(1)
                              .join(',')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-row justify-start items-center mb-0.5 text-sm w-full">
                <LocationIcon />
                <div className="text-sm ml-1 text-black font-medium capitalize">
                  Location not found
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="my-1">
        <AlertBox
          message={isError.message}
          type={isError.type}
          show={isError.isError}
          hide={() =>
            setIsError({
              isError: false,
              message: '',
              type: '',
            })
          }
        />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="starredLocations">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <div className="mt-4">
                {isGettingNearestSite && (
                  <div className="flex flex-row justify-center items-center mb-4">
                    <Spinner data-testid="spinner" width={25} height={25} />
                  </div>
                )}
                {locationArray && locationArray.length > 0 ? (
                  draggedLocations.map((location, index) => (
                    <Draggable
                      key={location.name}
                      draggableId={location.name}
                      index={index}
                    >
                      {(provided) => (
                        <LocationItemCards
                          key={location.name}
                          handleLocationSelect={handleLocationSelect}
                          handleRemoveLocation={removeLocation}
                          location={location}
                          draggableProps={provided.draggableProps}
                          dragHandleProps={provided.dragHandleProps}
                          innerRef={provided.innerRef}
                          showTrashIcon={true}
                          showActiveStarIcon={true}
                        />
                      )}
                    </Draggable>
                  ))
                ) : (
                  <NoSuggestions message="No locations selected" />
                )}
              </div>
              <div className="mt-6 mb-24">
                <h3 className="text-sm text-black-800 font-semibold">
                  Suggestions
                </h3>
                <div className="mt-3">
                  {unSelectedLocations && unSelectedLocations.length > 0 ? (
                    unSelectedLocations
                      .filter((location) => location != null)
                      .slice(0, 15)
                      .map((location) => (
                        <LocationItemCards
                          key={location.search_name}
                          location={location}
                          handleLocationSelect={handleLocationSelect}
                          showActiveStarIcon={false}
                        />
                      ))
                  ) : (
                    <NoSuggestions message="No suggestions" />
                  )}
                </div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default LocationsContentComponent;
