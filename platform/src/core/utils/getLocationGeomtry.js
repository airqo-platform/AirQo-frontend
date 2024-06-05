export const getPlaceDetails = async (placeId) => {
  const placesService = new google.maps.places.PlacesService(document.createElement('div'));

  const locationPromise = new Promise((resolve, reject) => {
    placesService.getDetails({ placeId }, (place, placeStatus) => {
      if (placeStatus === 'OK') {
        const {
          name,
          geometry: { location },
          place_id,
        } = place;
        resolve({
          description: name,
          latitude: location.lat(),
          longitude: location.lng(),
          place_id,
        });
      } else {
        reject(new Error(`Failed to retrieve details for place with ID ${placeId}`));
      }
    });
  });

  try {
    const locations = await locationPromise;
    return locations;
  } catch (error) {
    console.error('Failed to retrieve location details:', error);
    return [];
  }
};
