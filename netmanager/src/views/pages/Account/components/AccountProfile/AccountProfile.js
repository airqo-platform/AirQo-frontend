import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import ReactCrop from "react-image-crop";
import clsx from "clsx";
import moment from "moment";
import { makeStyles } from "@material-ui/styles";
import {
  Card,
  CardActions,
  CardContent,
  Avatar,
  Typography,
  Divider,
  Button,
  LinearProgress,
} from "@material-ui/core";

// css
import "react-image-crop/dist/ReactCrop.css";
import "assets/css/account-profile.css";

const useStyles = makeStyles((theme) => ({
  root: {},
  details: {
    display: "flex",
  },
  avatar: {
    marginLeft: "30%",
    height: "202px",
    width: "170px",
    flexShrink: 0,
    flexGrow: 0,
  },
  progress: {
    marginTop: theme.spacing(2),
  },
  uploadButton: {
    marginRight: theme.spacing(2),
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
  },
}));

const AccountProfile = (props) => {
  const { className, mappedAuth, ...rest } = props;

  const classes = useStyles();

  const { user } = mappedAuth;

  const [crop, setCrop] = useState({ aspect: 1 / 1, width: 30, unit: "%" });
  const [uploadedFile, setUploadedFile] = useState("");
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const hiddenFileInput = useRef(null);
  const imageRef = useRef(null);

  const cancelCrop = (event) => {
    event.preventDefault();
    setShowCrop(false);
  };
  const onPictureUploadClick = (event) => {
    event.preventDefault();
    hiddenFileInput.current.click();
  };

  const handleInputChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setUploadedFile(reader.result);
        setShowCrop(true);
      });
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const onImageLoaded = (image) => {
    imageRef.current = image;
  };

  const makeClientCrop = async () => {
    if (imageRef && crop.width && crop.height) {
      const croppedImageDataUrl = await getCroppedImg(
        imageRef.current,
        crop,
        "croppedImage.jpeg"
      );
      setCroppedImage(croppedImageDataUrl);
      console.log("cropped Image", croppedImageDataUrl);
    }
  };

  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error("Canvas is empty");
          return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          resolve(reader.result);
        });
        reader.readAsDataURL(blob);
      }, "image/jpeg");
    });
  };

  return (
    <>
      <Card {...rest} className={clsx(classes.root, className)}>
        <CardContent>
          <div className={classes.details}>
            <div>
              <Typography gutterBottom variant="h2">
                {`${user.firstName} ${user.lastName}`}
              </Typography>
              <Typography
                className={classes.locationText}
                color="textSecondary"
                variant="body1"
              >
                {(user.city &&
                  user.country &&
                  `${user.city}, ${user.country}`) ||
                  "Kampala, Uganda"}
              </Typography>
              <Typography
                className={classes.dateText}
                color="textSecondary"
                variant="body1"
              >
                {moment().format("hh:mm A")} ({"GMT+3"})
              </Typography>
            </div>
            <Avatar className={classes.avatar} src={user.avatar} />
          </div>
          <div className={classes.progress}>
            <Typography variant="body1">Profile Completeness: 70%</Typography>
            <LinearProgress value={70} variant="determinate" />
          </div>
        </CardContent>
        <Divider />
        <CardActions className={classes.buttonContainer}>
          <Button
            className={classes.uploadButton}
            color="primary"
            variant="text"
            onClick={onPictureUploadClick}
          >
            Upload picture
          </Button>
          <input
            type="file"
            accept="image/*"
            ref={hiddenFileInput}
            onChange={handleInputChange}
            style={{ display: "none" }}
          />
          <Button variant="text">Remove picture</Button>
        </CardActions>
      </Card>
      <div className={`img-crop-preview ${showCrop ? "" : "hidden"}`}>
        <div className={"crop-container"}>
          <div>crop photo</div>
          <ReactCrop
            src={uploadedFile}
            crop={crop}
            className={"react-crop"}
            style={{ maxHeight: "80vh", overflow: "scroll" }}
            imageStyle={{ width: "100%", height: "auto" }}
            onImageLoaded={onImageLoaded}
            onChange={(newCrop) => setCrop(newCrop)}
          />
          <div>
            <Button
              className={classes.uploadButton}
              color="primary"
              variant="outlined"
              onClick={cancelCrop}
            >
              Cancel
            </Button>
            <Button
              className={classes.uploadButton}
              color="primary"
              variant="contained"
              onClick={makeClientCrop}
            >
              Upload Photo
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

AccountProfile.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
  mappeduserState: PropTypes.object.isRequired,
};

export default AccountProfile;
