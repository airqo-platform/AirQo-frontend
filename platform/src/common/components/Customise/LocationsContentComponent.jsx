import React, { useEffect, useState } from 'react';
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
import Toast from '../Toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Spinner from '@/components/Spinner';

const LocationsContentComponent = ({ selectedLocations }) => {
  const dispatch = useDispatch();
  const gridsData = useSelector((state) => state.grids.sitesSummary);
  const gridsData2 = useSelector((state) => state.grids);
  console.log('gridsData2', gridsData2);
  const gridLocationsData = (gridsData && gridsData.sites) || [];
  const [isLoading, setIsLoading] = useState(false);

  const [location, setLocation] = useState('');
  const [inputSelect, setInputSelect] = useState(false);
  const [locationArray, setLocationArray] = useState(selectedLocations);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [unSelectedLocations, setUnSelectedLocations] = useState([]);
  const [draggedLocations, setDraggedLocations] = useState(selectedLocations);

  const handleLocationEntry = (e) => {
    setInputSelect(false);
    filterBySearch(e);
    setLocation(e.target.value);
  };

  const toggleInputSelect = () => {
    setFilteredLocations(unSelectedLocations);
    inputSelect ? setInputSelect(false) : setInputSelect(true);
  };

  const filterBySearch = (e) => {
    const query = e.target.value;
    let locationList = [...gridLocationsData];
    locationList = locationList.filter((location) => {
      return location.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    setFilteredLocations(locationList);
  };

  const handleLocationSelect = (item) => {
    const newLocationArray = [...locationArray];
    const index = newLocationArray.findIndex((location) => location._id === item._id);

    if (index !== -1) {
      newLocationArray.splice(index, 1);
    } else if (newLocationArray.length < 4) {
      newLocationArray.push(item);
    }

    setLocationArray(newLocationArray);
    setDraggedLocations(newLocationArray);
    setInputSelect(true);
    setLocation('');
  };
  const removeLocation = (item) => {
    const newLocationArray = locationArray.filter((location) => location._id !== item._id);
    setLocationArray(newLocationArray);
    setDraggedLocations(newLocationArray);
    setUnSelectedLocations((locations) => [...locations, item]);
    dispatch(setSelectedLocations(newLocationArray));
  };

  const onDragEnd = (result) => {
    const items = Array.from(draggedLocations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDraggedLocations(items);
  };

  useEffect(() => {
    if (gridLocationsData && gridLocationsData.length > 0) {
      setFilteredLocations(gridLocationsData);
    }
  }, [gridLocationsData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (gridLocationsData && gridLocationsData.length < 1) {
        await dispatch(getSitesSummary());
      }
      setIsLoading(false);
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
        throw error;
      }
    }
  }, [locationArray, gridLocationsData]);

  return (
    <form>
      <DragDropContext onDragEnd={onDragEnd}>
        {locationArray && locationArray.length > 4 && (
          <Toast type={'error'} message='Choose only 4 locations' timeout={6000} />
        )}
        {isLoading ? (
          <div className='flex flex-row mt-[100px] justify-center items-center'>
            <Spinner data-testid='spinner' width={25} height={25} />
          </div>
        ) : (
          <>
            <div className='mt-6'>
              <div className='w-full flex flex-row items-center justify-start'>
                <div className='flex items-center justify-center pl-3 bg-white border h-12 rounded-lg rounded-r-none border-r-0 border-input-light-outline focus:border-input-light-outline'>
                  <SearchIcon />
                </div>
                <input
                  onChange={(e) => {
                    handleLocationEntry(e);
                  }}
                  onClick={() => toggleInputSelect()}
                  value={location}
                  placeholder='Search Villages, Cities or Country'
                  className='input text-sm text-secondary-neutral-light-800 w-full h-12 ml-0 rounded-lg bg-white border-l-0 rounded-l-none border-input-light-outline focus:border-input-light-outline'
                />
              </div>
              {location !== '' && (
                <div
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

            <Droppable droppableId='starredLocations'>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {
                    <div className='mt-4'>
                      {locationArray && locationArray.length > 0 ? (
                        draggedLocations.map((location, index) => (
                          <Draggable draggableId={location._id} index={index}>
                            {(provided) => (
                              <div
                                className='border rounded-lg bg-secondary-neutral-light-25 border-input-light-outline flex flex-row justify-between items-center p-3 w-full mb-2'
                                key={location._id}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}>
                                <div className='flex flex-row items-center overflow-x-clip'>
                                  <div>
                                    <DragIcon />
                                  </div>
                                  <span className='text-sm text-secondary-neutral-light-800 font-medium'>
                                    {location.name}
                                  </span>
                                </div>
                                <div className='flex flex-row'>
                                  <div
                                    className='mr-1 hover:cursor-pointer'
                                    onClick={() => removeLocation(location)}>
                                    <TrashIcon />
                                  </div>
                                  <div
                                    className='bg-primary-600 rounded-md p-2 flex items-center justify-center hover:cursor-pointer'
                                    onClick={() => removeLocation(location)}>
                                    <StarIcon />
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <div className='flex flex-row justify-center mt-[60px] items-center mb-0.5 text-sm w-full'>
                          <div className='text-sm ml-1 text-black font-medium capitalize'>
                            No locations selected
                          </div>
                        </div>
                      )}
                    </div>
                  }
                  <div className='mt-6 mb-24'>
                    <h3 className='text-sm text-black-800 font-semibold'>Suggestions</h3>
                    <div className='mt-3'>
                      {unSelectedLocations && unSelectedLocations.length > 0 ? (
                        unSelectedLocations.slice(0, 15).map((location) => (
                          <div
                            className='border rounded-lg bg-secondary-neutral-light-25 border-input-light-outline flex flex-row justify-between items-center p-3 w-full mb-2'
                            key={location._id}>
                            <div className='flex flex-row items-center overflow-x-clip'>
                              <div>
                                <DragIconLight />
                              </div>
                              <span className='text-sm text-secondary-neutral-light-800 font-medium'>
                                {location.name}
                              </span>
                            </div>
                            <div className='flex flex-row'>
                              <div
                                className='border border-input-light-outline rounded-md p-2 flex items-center justify-center hover:cursor-pointer'
                                onClick={() => {
                                  handleLocationSelect(location);
                                }}>
                                <StarIconLight />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className='flex flex-row justify-center mt-[60px] items-center mb-0.5 text-sm w-full'>
                          <div className='text-sm ml-1 text-black font-medium capitalize'>
                            No suggestions
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          </>
        )}
      </DragDropContext>
    </form>
  );
};

export default LocationsContentComponent;
