import React, { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MUIPlacesAutocomplete, { geocodeBySuggestion } from 'mui-places-autocomplete';
import { useDispatch } from 'react-redux';
import { setLatAndLng } from 'redux/GooglePlaces/operations';

const AQSearch = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const onClose = () => {
    setOpen(false);
    setErrorMessage(null);
  };

  const onSuggestionSelected = (suggestion) => {
    geocodeBySuggestion(suggestion)
      .then((results) => {
        if (results.length < 1) {
          setOpen(true);
          setErrorMessage('Geocode request completed successfully but without any results');
          return;
        }

        const { geometry, place_id } = results[0];

        const coordinates = {
          lat: geometry.location.lat(),
          lng: geometry.location.lng(),
          placeId: place_id
        };
        dispatch(setLatAndLng(coordinates.lat, coordinates.lng, coordinates.placeId));
      })
      .catch((err) => {
        setOpen(true);
        setErrorMessage(err.message);
      });
  };

  const renderMessage = () => {
    if (errorMessage) {
      return `Failed to geocode suggestion because: ${errorMessage}`;
    }

    return null;
  };

  const createAutocompleteRequest = (inputValue) => {
    if (inputValue.length > 4) {
      return {
        input: inputValue
      };
    } else {
      return {
        input: ''
      };
    }
  };

  return (
    <div>
      <MUIPlacesAutocomplete
        onSuggestionSelected={onSuggestionSelected}
        renderTarget={() => <div />}
        textFieldProps={{ variant: 'outlined', fullWidth: true, type: 'search', autoFocus: true }}
        createAutocompleteRequest={createAutocompleteRequest}
      />
      <Snackbar
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={5000}
        open={open}
        message={<span>{renderMessage()}</span>}
        style={{ width: '70vw' }}
      />
    </div>
  );
};

export default AQSearch;
