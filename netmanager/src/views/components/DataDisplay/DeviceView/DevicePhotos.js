import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import ImageUploading from "react-images-uploading";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@material-ui/core";
import { PhotoOutlined } from "@material-ui/icons";
import { cloudinaryImageUpload } from "../../../apis/cloudinary";
import { updateMainAlert } from "redux/MainAlert/operations";
import { updateDeviceDetails } from "../../../apis/deviceRegistry";
import BrokenImage from "assets/img/BrokenImage";

const galleryContainerStyles = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
};

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: "100px",
  },
}));

const ImgWithSkeleton = ({
  srcOrSrcObject,
  cloudinaryUrls,
  updateCloudinaryUrls,
}) => {
  const classes = useStyles();
  const unpackSrcObject = (srcOrSrcObject) => {
    if (typeof srcOrSrcObject === "string") {
      return [srcOrSrcObject, () => {}];
    }
    if (srcOrSrcObject.moved) {
      return [srcOrSrcObject.data_url, srcOrSrcObject.asyncSrcCallback];
    }
    return [srcOrSrcObject.src, srcOrSrcObject.asyncSrcCallback];
  };
  const poison = "poison";
  const [src, asyncSrcCallback] = unpackSrcObject(srcOrSrcObject);
  const [newSrc, setNewSrc] = useState(src);
  const [response, setResponse] = useState(poison);
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const call = async () => {
      const responseData = await asyncSrcCallback();

      if (responseData) {
        setNewSrc(srcOrSrcObject.data_url);
      }
      setResponse((responseData && responseData.secure_url) || null);
    };

    if (typeof srcOrSrcObject === "object" && !srcOrSrcObject.moved) {
      call();
    }
  }, []);

  useEffect(() => {
    if (response !== poison) {
      updateCloudinaryUrls([...cloudinaryUrls, response]);
    }
  }, [response]);

  const onLoad = () => {
    if (newSrc === "") {
      return;
    }
    return setLoaded(true);
  };

  const onError = () => {
    if (newSrc) {
      setBroken(true);
      setLoaded(true);
    }
  };

  return (
    <div className={"device-img-skeleton-wrapper"}>
      <img
        src={newSrc}
        alt=""
        width="auto"
        height="100%"
        style={{ display: loaded && !broken ? "inline" : "none" }}
        onLoad={onLoad}
        onError={onError}
      />
      {broken && <BrokenImage className={"broken-image"} />}
      <div
        className={loaded ? "skeleton-hidden" : "device-img-skeleton"}
        style={{ width: "300px", height: "100%" }}
      >
        <PhotoOutlined className={classes.root} />
      </div>
    </div>
  );
};

export default function DevicePhotos({ deviceData }) {
  const dispatch = useDispatch();
  const [images, setImages] = useState(
    deviceData.pictures || [
      "https://res.cloudinary.com/dbibjvyhm/image/upload/v1604569404/sample.jpg",
    ]
  );
  const [newImages, setNewImages] = useState([]);
  const [cloudinaryUrls, setCloudinaryUrls] = useState([]);
  const [loadingImages, setLoadingImages] = useState({
    status: false,
    imgCount: 0,
  });
  const maxNumber = 69;

  useEffect(() => {
    if (
      loadingImages.imgCount > 0 &&
      cloudinaryUrls.length >= loadingImages.imgCount
    ) {
      setLoadingImages({ status: false, imgCount: 0 });
      const pictures = cloudinaryUrls.filter((url) => url !== null);
      pictures.length > 0 &&
        updateDeviceDetails(deviceData.name, { pictures })
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
    }
  }, [cloudinaryUrls]);

  const moveNewImagesToOldSection = async () => {
    if (newImages.length > 0) {
      const movedImages = [];
      newImages.map((image) => {
        movedImages.push({ ...image, moved: true });
      });
      await setNewImages([]);
      setImages([...images, ...movedImages]);
    }
  };

  const onChange = async (imageFiles) => {
    const newImages = [];
    await moveNewImagesToOldSection();
    setLoadingImages({ status: true, imgCount: imageFiles.length });
    imageFiles.map((imageFile) => {
      const formData = new FormData();
      formData.append("file", imageFile.file);
      formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);

      const callbackWrapper = async () => {
        return await cloudinaryImageUpload(formData)
          .then((responseData) => {
            return responseData;
          })
          .catch(() => {
            return null;
          });
      };
      newImages.push({
        src: "",
        asyncSrcCallback: callbackWrapper,
        data_url: imageFile.data_url,
        moved: false,
      });
    });

    setNewImages(newImages);
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
            <Button
              disabled={loadingImages.status}
              variant="contained"
              color="primary"
              onClick={onImageUpload}
            >
              Add Photo(s)
            </Button>
          </div>
        )}
      </ImageUploading>
      {newImages.length > 0 && (
        <div style={galleryContainerStyles}>
          <div style={{ width: "100%", color: "blue" }}>New Image(s)</div>
          {newImages.map((srcOrObject, index) => (
            <ImgWithSkeleton
              srcOrSrcObject={srcOrObject}
              cloudinaryUrls={cloudinaryUrls}
              updateCloudinaryUrls={setCloudinaryUrls}
              key={index}
            />
          ))}
        </div>
      )}
      <div style={galleryContainerStyles}>
        {newImages.length > 0 && images.length > 0 && (
          <div style={{ width: "100%", color: "blue" }}>Old Image(s)</div>
        )}
        {images.map((srcOrObject, index) => (
          <ImgWithSkeleton
            srcOrSrcObject={srcOrObject}
            cloudinaryUrls={cloudinaryUrls}
            updateCloudinaryUrls={setCloudinaryUrls}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
