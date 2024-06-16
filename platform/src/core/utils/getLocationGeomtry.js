export const getPlaceDetails = async (placeId) => {
  const geocoder = new google.maps.Geocoder();

  const locationPromise = new Promise((resolve, reject) => {
    geocoder.geocode({ placeId }, (results, status) => {
      if (status === 'OK') {
        const {
          formatted_address: description,
          geometry: { location },
          place_id,
        } = results[0];
        resolve({
          description,
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
