export const getAutocompleteSuggestions = (input, sessionToken) => {
  return new Promise((resolve, reject) => {
    const autocompleteService = new google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      {
        input: input,
        types: ['establishment', 'geocode'],
        sessionToken: sessionToken,
      },
      (predictions, status) => {
        if (status === 'OK') {
          resolve(predictions);
        } else {
          reject(
            new Error(
              `Autocomplete search failed with status ${status}. Please try again.`,
            ),
          );
        }
      },
    );
  });
};
