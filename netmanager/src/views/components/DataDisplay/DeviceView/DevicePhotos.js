import React, { useState, useEffect } from "react";
import ImageUploading from "react-images-uploading";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@material-ui/core";
import { PhotoOutlined } from "@material-ui/icons";
import { cloudinaryImageUpload } from "../../../apis/cloudinary";

const galleryContainerStyles = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
};

const galleryItemStyles = {
  margin: "10px",
  height: "400px",
};

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: "100px",
  },
}));

const ImgWithSkeleton = ({ src }) => {
  const classes = useStyles();
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={"device-img-skeleton-wrapper"} style={galleryItemStyles}>
      <img
        src={src}
        alt=""
        width="auto"
        height="100%"
        style={{ display: loaded ? "inline" : "none" }}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <div
          className={"device-img-skeleton"}
          style={{ width: "400px", height: "100%" }}
        >
          <PhotoOutlined className={classes.root} />
        </div>
      )}
    </div>
  );
};

const Gallery = ({
  imageList,
  onImageUpload,
  onImageRemoveAll,
  onImageUpdate,
  onImageRemove,
  isDragging,
  dragProps,
}) => {
  return (
    <>
      <div style={galleryContainerStyles}>
        {imageList.map((image, index) => (
          <ImgWithSkeleton image={image} key={index} />
        ))}
      </div>
    </>
  );
};

export default function DevicePhotos({ deviceData }) {
  const [images, setImages] = useState(deviceData.pictures || []);
  const [newImages, setNewImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState({
    status: false,
    imgCount: 0,
  });
  const [updateIndex, setUpdateIndex] = useState(-1);
  const maxNumber = 69;

  useEffect(() => {
    console.log('images', images)
  }, [loadingImages]);

  useEffect(() => {
    if (updateIndex >= 0) {
      let updatedImages = [...images];
      updatedImages[updateIndex] = newImages[updateIndex] && newImages[updateIndex].data_url || images[updateIndex];
      console.log("updated after", updatedImages);
      console.log("key", updateIndex);
      console.log("images new", newImages);
      console.log("images old", images);
      setImages(updatedImages);
    }
  }, [updateIndex]);

  useEffect(() => {
    console.log("new images", images);
  }, [images]);

  const uploadImages = (imagesToUpload) => {
    imagesToUpload.map((image, index) => {
      const formData = new FormData();
      formData.append("file", image.file);
      formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
      cloudinaryImageUpload(formData)
        .then((responseData) => {
          setUpdateIndex(index);
          setLoadingImages({
            status: loadingImages.imgCount - 1 > 0,
            imgCount: loadingImages.imgCount - 1,
          });
        })
        .catch((err) => {
          setLoadingImages({
            status: loadingImages.imgCount - 1 > 0,
            imgCount: loadingImages.imgCount - 1,
          });
        });
    });
  };

  const createImagePlaceholders = (images, value) => {
    let placeHolders = [];
    images.map(() => {
      placeHolders.push(value || "");
    });
    return placeHolders;
  };

  const onChange = async (imageList) => {
    await setLoadingImages({ status: true, imgCount: imageList.length });
    await setImages([...createImagePlaceholders(imageList), ...images]);
    await setNewImages(imageList);
    uploadImages(imageList);
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
      <div style={galleryContainerStyles}>
        {images.map((src, index) => (
          <ImgWithSkeleton src={src} key={index} />
        ))}
      </div>
    </div>
  );
}
