import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ImageUploading from 'react-images-uploading';
import { Button } from '@material-ui/core';
import { cloudinaryImageUpload } from 'views/apis/cloudinary';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ClearIcon from '@material-ui/icons/Clear';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { updateDeviceDetails } from 'views/apis/deviceRegistry';
import BrokenImage from 'assets/img/BrokenImage';
import ConfirmDialog from 'views/containers/ConfirmDialog';
import { deleteDevicePhotos } from 'views/apis/deviceRegistry';
import ImagePreview from 'views/containers/ImagePreview';
import { getDevicePhotos, softCreateDevicePhoto } from '../../../apis/deviceRegistry';
import { isEmpty } from 'underscore';

const galleryContainerStyles = {
  display: 'flex',
  flexWrap: 'wrap'
};

const ImgLoadStatus = ({ message, error, onClose }) => {
  const moreStyles = error
    ? { background: 'rgb(252, 235, 234)', color: 'rgb(91, 22, 21)' }
    : { background: 'rgb(232, 243, 252)', color: 'rgb(12, 54, 91)' };
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        textTransform: 'capitalize',
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '18px',
        letterSpacing: '-0.04px',
        ...moreStyles
      }}>
      {message}
      <ClearIcon className={'d-img'} onClick={onClose} />
    </div>
  );
};

const Img = ({ src, uploadOptions, setDelState, setPreviewState }) => {
  const { upload, deviceName, deviceId } = uploadOptions || {
    upload: false,
    deviceName: '',
    deviceId: ''
  };
  const [url, setUrl] = useState(src);
  const [broken, setBroken] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const dispatch = useDispatch();

  const closeLoader = () => {
    setUploading(false);
    setUploadError(false);
  };

  const showUploading = () => {
    setUploading(true);
    setUploadError(false);
  };

  const showUploadError = () => {
    setUploading(false);
    setUploadError(true);
  };

  // function to handle the errors
  const handleError = (err) => {
    const errors = err.response.data.errors.message;
    dispatch(
      updateMainAlert({
        message: errors,
        show: true,
        severity: 'error'
      })
    );
    showUploadError();
  };

  const uploadImage = async (src) => {
    const formData = new FormData();
    formData.append('file', src);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_PRESET);
    formData.append('folder', `devices/${deviceName}`);
    formData.append('cloud_name', process.env.REACT_APP_CLOUD_NAME);

    showUploading();

    try {
      // awaiting for the cloudinary image upload response
      const { secure_url: img_url } = await cloudinaryImageUpload(formData);

      setUrl(img_url);

      const deviceImgData = {
        device_name: deviceName,
        device_id: deviceId,
        image_url: img_url
      };

      // creating image in the database
      const { message } = await softCreateDevicePhoto(deviceImgData);

      dispatch(
        updateMainAlert({
          message,
          show: true,
          severity: 'success'
        })
      );
      closeLoader();

      setTimeout(() => {
        window.location.reload();
      }, 1300);
    } catch (err) {
      // calling the helper function to handle errors
      handleError(err);
    }
  };

  useEffect(() => {
    if (upload) {
      uploadImage(src);
    }
  }, []);

  return (
    <div className={'device-image-wrapper'}>
      <div className={'img-wrapper'}>
        {!broken && src && (
          <img
            className={'image'}
            src={src}
            alt={'image'}
            // style={{background: `url(${src})`}}
            onError={() => setBroken(true)}
            onClick={() => setPreviewState({ open: true, url: url })}
          />
        )}
        {(!src || broken) && <BrokenImage className={'broken-image'} />}
      </div>
      <div className={'image-controls'}>
        {!uploading && !uploadError && (
          <DeleteOutlineIcon
            className={'image-del'}
            onClick={() =>
              setDelState({
                open: true,
                url: url
              })
            }
          />
        )}
        {uploading && <ImgLoadStatus message={'uploading image...'} onClose={closeLoader} />}
        {uploadError && <ImgLoadStatus message={'upload failed'} error onClose={closeLoader} />}
      </div>
    </div>
  );
};

export default function DevicePhotos({ deviceData }) {
  const dispatch = useDispatch();
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [photoDelState, setPhotoDelState] = useState({
    open: false,
    url: null,
    id: null
  });
  const [photoPreview, setPhotoPreview] = useState({
    open: false,
    url: null
  });
  const maxNumber = 69;

  const loadDevicePhotos = async () => {
    await getDevicePhotos(deviceData._id)
      .then((responseData) => {
        const photosList = responseData.photos;
        setImages(photosList);
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            message: 'Unable to load images',
            show: true,
            severity: 'error'
          })
        );
      });
  };

  useEffect(() => {
    if (!isEmpty(deviceData)) {
      if (isEmpty(images)) {
        loadDevicePhotos();
      }
    }
  }, [images, deviceData]);

  const onChange = async (imageFiles) => {
    const uploadImages = [];
    imageFiles.map((imageFile) => uploadImages.push(imageFile.data_url));
    setImages([...images, ...newImages]);
    setNewImages([]);
    setNewImages(uploadImages);
  };

  // this will handle the deletion of the image
  const handlePictureDeletion = async () => {
    await setPhotoDelState({ ...photoDelState, open: false });
    if (photoDelState.url) {
      try {
        const responseData = await deleteDevicePhotos(photoDelState.id, [photoDelState.url]);
        setImages((responseData.updatedDevice && responseData.updatedDevice.pictures) || []);
        setNewImages([]);
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: 'success'
          })
        );
      } catch (err) {
        const errors = err.response.data.message;
        dispatch(
          updateMainAlert({
            message: errors,
            show: true,
            severity: 'error'
          })
        );
      }
      setPhotoDelState({
        open: false,
        url: null,
        id: null
      });
    }
  };

  // this will render the images
  function renderImages(images, isNew) {
    // creating a Set object to store unique image URLs to avoid the same image being rendered twice on the screen
    const imageSet = new Set();

    // looping over the images array and adding the URLs to the Set object
    for (let image of images) {
      if (isNew) {
        imageSet.add(image);
      } else {
        imageSet.add({ url: image.image_url, _id: image._id });
      }
    }

    return (
      imageSet.size > 0 && (
        <div style={galleryContainerStyles}>
          {isNew && <div style={{ width: '100%', color: 'blue' }}>New Image(s)</div>}
          {!isNew && imageSet.size > 0 && (
            <div style={{ width: '100%', color: 'blue' }}>Old Image(s)</div>
          )}
          {[...imageSet].map((src, index) => (
            <Img
              src={src.url || src}
              uploadOptions={
                isNew
                  ? {
                      upload: true,
                      deviceName: deviceData.name,
                      deviceId: deviceData._id
                    }
                  : null
              }
              setDelState={
                isNew
                  ? setPhotoDelState
                  : () => {
                      setPhotoDelState({
                        open: true,
                        url: src.url,
                        id: src._id
                      });
                    }
              }
              setPreviewState={setPhotoPreview}
              key={index}
            />
          ))}
        </div>
      )
    );
  }

  return (
    <div className="App">
      <ImageUploading
        multiple
        value={[]}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url">
        {({ onImageUpload }) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              margin: '10px 0'
            }}>
            <Button variant="contained" color="primary" onClick={onImageUpload}>
              Add Photo(s)
            </Button>
          </div>
        )}
      </ImageUploading>
      {renderImages(newImages, true)}
      {renderImages(images, false)}
      <ConfirmDialog
        open={photoDelState.open}
        title={'Delete photo?'}
        message={`Are you sure delete this photo?`}
        close={() =>
          setPhotoDelState({
            open: false,
            url: null,
            id: null
          })
        }
        confirm={handlePictureDeletion}
        error
      />
      <ImagePreview
        open={photoPreview.open}
        src={photoPreview.url}
        close={() => setPhotoPreview({ open: false, url: null })}
      />
    </div>
  );
}
