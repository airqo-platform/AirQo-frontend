import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedLocations,
  getSitesSummary,
} from '@/lib/store/services/deviceRegistry/GridsSlice';
import SearchIcon from '@/icons/Common/search_md.svg';
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
}) => (
  <div
    className='border rounded-lg bg-secondary-neutral-light-25 border-input-light-outline flex flex-row justify-between items-center p-3 w-full mb-2'
    key={location._id}
    ref={innerRef}
    {...draggableProps}
    {...dragHandleProps}>
    <div className='flex flex-row items-center overflow-x-clip'>
      <div>{showActiveStarIcon ? <DragIcon /> : <DragIconLight />}</div>
      <span className='text-sm text-secondary-neutral-light-800 font-medium'>{location.name}</span>
    </div>
    <div className='flex flex-row'>
      {showTrashIcon && (
        <div className='mr-1 hover:cursor-pointer' onClick={() => handleRemoveLocation(location)}>
          <TrashIcon />
        </div>
      )}
      {showActiveStarIcon ? (
        <div
          className='bg-primary-600 rounded-md p-2 flex items-center justify-center hover:cursor-pointer'
          onClick={() => handleLocationSelect(location)}>
          <StarIcon />
        </div>
      ) : (
        <div
          className='border border-input-light-outline rounded-md p-2 flex items-center justify-center hover:cursor-pointer'
          onClick={() => handleLocationSelect(location)}>
          <StarIconLight />
        </div>
      )}
    </div>
  </div>
);

/**
 * @param {Object} props
 * @returns {JSX.Element}
 * @description Renders the no suggestions message
 * when there are no suggestions or locations found
 */
const NoSuggestions = ({ message }) => (
  <div className='flex flex-row justify-center mt-[60px] items-center mb-0.5 text-sm w-full'>
    <div className='text-sm ml-1 text-black font-medium capitalize'>{message}</div>
  </div>
);

const LocationsContentComponent = ({ selectedLocations }) => {
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const gridsData = useSelector((state) => state.grids.sitesSummary);
  const gridLocationsData = (gridsData && gridsData.sites) || [];
  const [isLoading, setIsLoading] = useState(false);

  const [location, setLocation] = useState('');
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

  useEffect(() => {
    if (gridLocationsData && gridLocationsData.length > 0) {
      setFilteredLocations(gridLocationsData);
    }
  }, [gridLocationsData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (gridLocationsData && gridLocationsData.length < 1) {
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
    if (gridLocationsData && gridLocationsData.length > 0) {
      try {
        dispatch(setSelectedLocations(locationArray));
        while (unSelectedLocations.length < 8) {
          const randomIndex = Math.floor(Math.random() * gridLocationsData.length);
          const randomObject = gridLocationsData[randomIndex];
          if (!unSelectedLocations.find((location) => location._id === randomObject._id)) {
            unSelectedLocations.push(randomObject);
          }
        }
      } catch (error) {
        return;
      }
    }
  }, [locationArray, gridLocationsData]);

  /**
   * @param {Object} e
   * @returns {void}
   * @description Filters the locations based on the search query
   * and updates the filtered locations array
   */
  const filterBySearch = (e) => {
    const query = e.target.value.toLowerCase();
    const locationList = gridLocationsData.filter((location) =>
      location.name.toLowerCase().includes(query),
    );
    setFilteredLocations(locationList);
  };

  /**
   * @param {Object} e
   * @returns {void}
   * @description Handles the location entry and filters the locations based on the search query
   */
  const handleLocationEntry = (e) => {
    setInputSelect(false);
    filterBySearch(e);
    setLocation(e.target.value);
  };

  /**
   * @param {Object} e
   * @returns {void}
   * @description hides the search dropdown when clicked outside the search dropdown
   * and resets the search input
   */
  useOutsideClick(searchRef, () => {
    setFilteredLocations(unSelectedLocations);
    setInputSelect(!inputSelect);
    setLocation('');
  });

  /**
   * @param {Object} item
   * @returns {void}
   * @description Handles the selection of a location and adds it to the selected locations
   * array
   */
  const handleLocationSelect = (item) => {
    const newLocationArray = [...locationArray];
    const index = newLocationArray.findIndex((location) => location._id === item._id);

    if (index !== -1) {
      newLocationArray.splice(index, 1);
    } else if (newLocationArray.length < 4) {
      newLocationArray.push(item);
      const unselectedIndex = unSelectedLocations.findIndex(
        (location) => location._id === item._id,
      );
      unSelectedLocations.splice(unselectedIndex, 1);
    } else {
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
    setLocation('');
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
    const newLocationArray = locationArray.filter((location) => location._id !== item._id);
    setLocationArray(newLocationArray);
    setDraggedLocations(newLocationArray);
    setUnSelectedLocations((locations) => [...locations, item]);
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

  if (isLoading) {
    return (
      <div className='flex flex-row mt-[100px] justify-center items-center'>
        <Spinner data-testid='spinner' width={25} height={25} />
      </div>
    );
  }

  return (
    <div>
      <div className='mt-6'>
        <div className='w-full flex flex-row items-center justify-start'>
          <div className='flex items-center justify-center pl-3 bg-white border h-12 rounded-lg rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline'>
            <SearchIcon />
          </div>
          <input
            onChange={(e) => {
              handleLocationEntry(e);
            }}
            value={location}
            placeholder='Search Villages, Cities or Country'
            className='input text-sm text-secondary-neutral-light-800 w-full h-12 ml-0 rounded-lg bg-white border-l-0 rounded-l-none border-input-light-outline focus:border-input-light-outline'
          />
        </div>
        {location !== '' && (
          <div
            ref={searchRef}
            className={`bg-white max-h-48 overflow-y-scroll px-3 pt-2 pr-1 my-1 border border-input-light-outline rounded-md ${
              inputSelect ? 'hidden' : 'relative'
            }`}>
            {filteredLocations && filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <div
                  className='flex flex-row justify-start items-center mb-0.5 text-sm w-full hover:cursor-pointer'
                  onClick={() => {
                    handleLocationSelect(location);
                  }}
                  key={location._id}>
                  <LocationIcon />
                  <div className='text-sm ml-1 text-black capitalize'>{location.name}</div>
                </div>
              ))
            ) : (
              <div className='flex flex-row justify-start items-center mb-0.5 text-sm w-full'>
                <LocationIcon />
                <div className='text-sm ml-1 text-black font-medium capitalize'>
                  Location not found
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='starredLocations'>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <div className='mt-4'>
                {locationArray && locationArray.length > 0 ? (
                  draggedLocations.map((location, index) => (
                    <Draggable key={location._id} draggableId={location._id} index={index}>
                      {(provided) => (
                        <LocationItemCards
                          key={location._id}
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
                  <NoSuggestions message='No locations selected' />
                )}
              </div>
              <div className='mt-6 mb-24'>
                <h3 className='text-sm text-black-800 font-semibold'>Suggestions</h3>
                <div className='my-1'>
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
                <div className='mt-3'>
                  {unSelectedLocations && unSelectedLocations.length > 0 ? (
                    unSelectedLocations
                      .slice(0, 15)
                      .map((location) => (
                        <LocationItemCards
                          key={location._id}
                          location={location}
                          handleLocationSelect={handleLocationSelect}
                          showActiveStarIcon={false}
                        />
                      ))
                  ) : (
                    <NoSuggestions message='No suggestions' />
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
