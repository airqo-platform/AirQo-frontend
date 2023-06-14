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

const Img = ({ src, uploadOptions, setDelState, setPreviewState, fetchImages }) => {
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

      // calling the fetch image function
      fetchImages();
    } catch (err) {
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
  const [photoDelState, setPhotoDelState] = useState({
    open: false,
    url: null,
    id: null
  });
  const maxNumber = 69;

  // loading device photos from the server
  const loadDevicePhotos = async () => {
    try {
      const responseData = await getDevicePhotos(deviceData._id);
      setImages(responseData.photos);
    } catch (err) {
      dispatch(
        updateMainAlert({
          message: 'Unable to load images',
          show: true,
          severity: 'error'
        })
      );
    }
  };

  // this will handle the deletion of the image
  const handlePictureDeletion = async () => {
    setPhotoDelState({ ...photoDelState, open: false });

    if (photoDelState.url) {
      try {
        const responseData = await deleteDevicePhotos(photoDelState.id, [photoDelState.url]);

        // updating the images state by removing the deleted image from the array
        setImages((prevImages) => prevImages.filter((img) => img !== photoDelState.url));

        loadDevicePhotos();

        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: 'success'
          })
        );
      } catch (err) {
        dispatch(
          updateMainAlert({
            message: err.response.data.message,
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

  useEffect(() => {
    if (!isEmpty(deviceData)) {
      loadDevicePhotos();
    }
  }, [deviceData]);

  // handling image upload from the user
  const onChange = async (imageFiles) => {
    const uploadImages = imageFiles.map((imageFile) => imageFile.data_url);
    setImages([...images, ...uploadImages]);
  };

  // rendering the images in a gallery
  function renderImages(images) {
    const imageSet = new Set(images);
    return (
      imageSet.size > 0 && (
        <div style={galleryContainerStyles}>
          {[...imageSet].map((src, index) => (
            <Img
              fetchImages={loadDevicePhotos}
              src={src.image_url || src}
              uploadOptions={{
                upload: !src.image_url,
                deviceName: deviceData.name,
                deviceId: deviceData._id
              }}
              setDelState={() =>
                setPhotoDelState({
                  open: true,
                  url: src.image_url,
                  id: src._id
                })
              }
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
      <h4 style={{ textAlign: 'center', fontWeight: 'bold' }}>
        {deviceData && deviceData?.name
          ? deviceData?.name?.charAt(0).toUpperCase() + deviceData?.name?.slice(1) + ' ' + 'Uploads'
          : ' '}
      </h4>
      {/* rendering the images */}
      {images.length > 0 ? renderImages(images) : <p>No available uploads</p>}
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
    </div>
  );
}
