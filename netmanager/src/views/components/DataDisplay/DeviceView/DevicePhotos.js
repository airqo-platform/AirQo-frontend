import React, { useState } from "react";
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

const ImgWithSkeleton = ({ key, image }) => {
  const classes = useStyles();
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      key={key}
      className={"device-img-skeleton-wrapper"}
      style={galleryItemStyles}
    >
      {loaded ? (
        <img src={image["data_url"]} alt="" width="auto" height="100%" />
      ) : (
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
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "10px 0",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          style={isDragging ? { color: "red" } : undefined}
          onClick={onImageUpload}
          {...dragProps}
        >
          {" "}
          Add Photo(s)
        </Button>
      </div>
      <div style={galleryContainerStyles}>
        {imageList.map((image, index) => (
          <ImgWithSkeleton image={image} key={index} />
        ))}
      </div>
    </>
  );
};

export default function DevicePhotos() {
  const [images, setImages] = useState([]);
  const maxNumber = 69;

  const uploadImages = async () => {
    images.map((image) => {
      const formData = new FormData();
      formData.append("file", image.file);
      formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
      console.log("preset", process.env.REACT_APP_CLOUDINARY_PRESET);
      cloudinaryImageUpload(formData)
        .then((responseData) => {
          console.log("cloudinary response", responseData);
        })
        .catch((err) => {
          console.log("cloudinary error", err);
          debugger;
        });
    });
  };

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  return (
    <div className="App">
      <Button variant="contained" color="primary" onClick={uploadImages}>
        upload
      </Button>
      <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          <Gallery
            imageList={imageList}
            onImageUpload={onImageUpload}
            onImageRemoveAll={onImageRemoveAll}
            onImageUpdate={onImageUpdate}
            onImageRemove={onImageRemove}
            isDragging={isDragging}
            dragProps={dragProps}
          />
        )}
      </ImageUploading>
    </div>
  );
}
