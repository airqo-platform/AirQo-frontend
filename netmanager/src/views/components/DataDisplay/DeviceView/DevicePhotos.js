import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import ImageUploading from "react-images-uploading";
import { Button } from "@material-ui/core";
import { cloudinaryImageUpload } from "views/apis/cloudinary";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ClearIcon from "@material-ui/icons/Clear";
import { updateMainAlert } from "redux/MainAlert/operations";
import { updateDeviceDetails } from "views/apis/deviceRegistry";
import BrokenImage from "assets/img/BrokenImage";
import ConfirmDialog from "views/containers/ConfirmDialog";
import { deleteDevicePhotos } from "views/apis/deviceRegistry";
import ImagePreview from "views/containers/ImagePreview";

const galleryContainerStyles = {
  display: "flex",
  flexWrap: "wrap",
};

const ImgLoadStatus = ({ message, error, onClose }) => {
  const moreStyles = error
    ? { background: "rgb(252, 235, 234)", color: "rgb(91, 22, 21)" }
    : { background: "rgb(232, 243, 252)", color: "rgb(12, 54, 91)" };
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
        textTransform: "capitalize",
        fontFamily: "Roboto, Helvetica, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: "18px",
        letterSpacing: "-0.04px",
        ...moreStyles,
      }}
    >
      {message}
      <ClearIcon className={"d-img"} onClick={onClose} />
    </div>
  );
};

const Img = ({ src, uploadOptions, setDelState, setPreviewState }) => {
  const { upload, deviceName } = uploadOptions || {
    upload: false,
    deviceName: "",
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

  const uploadImage = async (src) => {
    const formData = new FormData();
    formData.append("file", src);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
    formData.append("folder", `devices/${deviceName}`);
    showUploading();
    return await cloudinaryImageUpload(formData)
      .then((responseData) => {
        const pictures = [responseData.secure_url];
        setUrl(responseData.secure_url);
        updateDeviceDetails(deviceName, { pictures })
          .then((responseData) => {
            dispatch(
              updateMainAlert({
                message: responseData.message,
                show: true,
                severity: "success",
              })
            );
            closeLoader();
          })
          .catch(() => {
            dispatch(
              updateMainAlert({
                message: "Could not persist images",
                show: true,
                severity: "error",
              })
            );
            showUploadError();
          });
      })
      .catch(() => {
        showUploadError();
      });
  };

  useEffect(() => {
    if (upload) {
      uploadImage(src);
    }
  }, []);

  return (
    <div className={"device-image-wrapper"}>
      <div className={"img-wrapper"}>
        {!broken && src && (
          <img
            className={"image"}
            src={src}
            alt={"image"}
            // style={{background: `url(${src})`}}
            onError={() => setBroken(true)}
            onClick={() => setPreviewState({ open: true, url: url })}
          />
        )}
        {(!src || broken) && <BrokenImage className={"broken-image"} />}
      </div>
      <div className={"image-controls"}>
        {!uploading && !uploadError && (
          <DeleteOutlineIcon
            className={"image-del"}
            onClick={() =>
              setDelState({
                open: true,
                url: url,
              })
            }
          />
        )}
        {uploading && (
          <ImgLoadStatus message={"uploading image..."} onClose={closeLoader} />
        )}
        {uploadError && (
          <ImgLoadStatus
            message={"upload failed"}
            error
            onClose={closeLoader}
          />
        )}
      </div>
    </div>
  );
};

export default function DevicePhotos({ deviceData }) {
  const dispatch = useDispatch();
  const [images, setImages] = useState(deviceData.pictures || []);
  const [newImages, setNewImages] = useState([]);
  const [photoDelState, setPhotoDelState] = useState({
    open: false,
    url: null,
  });
  const [photoPreview, setPhotoPreview] = useState({
    open: false,
    url: null,
  });
  const maxNumber = 69;

  const onChange = async (imageFiles) => {
    const uploadImages = [];
    await setImages([...images, ...newImages]);
    await setNewImages([]);
    imageFiles.map((imageFile) => uploadImages.push(imageFile.data_url));

    setNewImages(uploadImages);
  };

  const handlePictureDeletion = async () => {
    await setPhotoDelState({ ...photoDelState, open: false });
    if (photoDelState.url) {
      await deleteDevicePhotos(deviceData.name, [photoDelState.url])
        .then((responseData) => {
          setImages(responseData.pictures || []);
          setNewImages([]);
          dispatch(
            updateMainAlert({
              message: responseData.message,
              show: true,
              severity: "success",
            })
          );
        })
        .catch((err) => {
          dispatch(
            updateMainAlert({
              message: "Could not delete image",
              show: true,
              severity: "error",
            })
          );
        });
      setPhotoDelState({
        open: false,
        url: null,
      });
    }
  };

  return (
    <div className="App">
      <ImageUploading
        multiple
        value={[]}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({ onImageUpload }) => (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "10px 0",
            }}
          >
            <Button variant="contained" color="primary" onClick={onImageUpload}>
              Add Photo(s)
            </Button>
          </div>
        )}
      </ImageUploading>
      {newImages.length > 0 && (
        <div style={galleryContainerStyles}>
          <div style={{ width: "100%", color: "blue" }}>New Image(s)</div>
          {newImages.map((src, index) => (
            <Img
              src={src}
              uploadOptions={{ upload: true, deviceName: deviceData.name }}
              setDelState={setPhotoDelState}
              setPreviewState={setPhotoPreview}
              key={index}
            />
          ))}
        </div>
      )}
      <div style={galleryContainerStyles}>
        {newImages.length > 0 && images.length > 0 && (
          <div style={{ width: "100%", color: "blue" }}>Old Image(s)</div>
        )}
        {images.map((src, index) => (
          <Img
            src={src}
            setDelState={setPhotoDelState}
            setPreviewState={setPhotoPreview}
            key={index}
          />
        ))}
      </div>
      <ConfirmDialog
        open={photoDelState.open}
        title={"Delete photo?"}
        message={`Are you sure delete this ${photoDelState.url} photo?`}
        close={() =>
          setPhotoDelState({
            open: false,
            url: null,
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
