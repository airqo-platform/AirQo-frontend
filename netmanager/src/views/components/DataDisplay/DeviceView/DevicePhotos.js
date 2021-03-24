import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import ImageUploading from "react-images-uploading";
import { Button } from "@material-ui/core";
import { cloudinaryImageUpload } from "views/apis/cloudinary";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { updateMainAlert } from "redux/MainAlert/operations";
import { updateDeviceDetails } from "views/apis/deviceRegistry";
import BrokenImage from "assets/img/BrokenImage";

const galleryContainerStyles = {
  display: "flex",
  flexWrap: "wrap",
};

const Img = ({ src, uploadOptions }) => {
  const { upload, deviceName } = uploadOptions || {
    upload: false,
    deviceName: "",
  };
  const [broken, setBroken] = useState(false);
  const dispatch = useDispatch();

  const uploadImage = async (src) => {
    const formData = new FormData();
    formData.append("file", src);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
    formData.append("folder", `devices/${deviceName}`);
    return await cloudinaryImageUpload(formData).then((responseData) => {
      const pictures = [responseData.secure_url];
      updateDeviceDetails(deviceName, { pictures })
        .then((responseData) => {
          dispatch(
            updateMainAlert({
              message: responseData.message,
              show: true,
              severity: "success",
            })
          );
        })
        .catch(() => {
          dispatch(
            updateMainAlert({
              message: "Could not persist images",
              show: true,
              severity: "error",
            })
          );
        });
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
          />
        )}
        {(!src || broken) && <BrokenImage className={"broken-image"} />}
      </div>
      <div className={"image-controls"}>
        <DeleteOutlineIcon className={"image-del"} />
      </div>
    </div>
  );
};

export default function DevicePhotos({ deviceData }) {
  const [images, setImages] = useState(deviceData.pictures || []);
  const [newImages, setNewImages] = useState([]);
  const maxNumber = 69;

  const onChange = async (imageFiles) => {
    const uploadImages = [];
    await setImages([...images, ...newImages]);
    await setNewImages([]);
    imageFiles.map((imageFile) => uploadImages.push(imageFile.data_url));

    setNewImages(uploadImages);
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
          <Img src={src} key={index} />
        ))}
      </div>
    </div>
  );
}
