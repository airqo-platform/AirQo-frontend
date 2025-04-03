export const getPlaceDetails = async (mapbox_id:string) => {
  const geocoder = new google.maps.Geocoder();

  const locationPromise = new Promise((resolve, reject) => {
    geocoder.geocode({ mapbox_id }, (results: { formatted_address: any; geometry: { location: any; }; mapbox_id: any; }[], status: string) => {
      if (status === 'OK') {
        const {
          formatted_address: description,
          geometry: { location },
          mapbox_id,
        } = results[0];
        resolve({
          description,
          latitude: location.lat(),
          longitude: location.lng(),
          mapbox_id,
        });
      } else {
        reject(
          new Error(`Failed to retrieve details for place with ID ${mapbox_id}`),
        );
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
