import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import ReactCrop from "react-image-crop";
import clsx from "clsx";
import moment from "moment";
import { makeStyles, useTheme } from "@material-ui/styles";
import {
  Card,
  CardActions,
  CardContent,
  Avatar,
  Typography,
  Divider,
  Button,
  useMediaQuery,
} from "@material-ui/core";
import { cloudinaryImageUpload } from "views/apis/cloudinary";
import { updateMainAlert } from "redux/MainAlert/operations";
import { updateAuthenticatedUserApi } from "views/apis/authService";
import { updateAuthenticatedUserSuccess } from "redux/Join/actions";
import usersStateConnector from "views/stateConnectors/usersStateConnector";

// css
import "react-image-crop/dist/ReactCrop.css";
import "assets/css/account-profile.css";

const useStyles = makeStyles((theme) => ({
  root: {},
  details: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailsMini: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  avatar: {
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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), {
    defaultMatches: true,
  });

  const { user } = mappedAuth;
  const dispatch = useDispatch();
  const [crop, setCrop] = useState({ aspect: 1 / 1, width: 30, unit: "%" });
  const [uploadedFile, setUploadedFile] = useState("");
  const [showCrop, setShowCrop] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
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

  const handleRemoveImage = async (event) => {
    event.preventDefault();
    const updateData = { profilePicture: "" };
    return await updateAuthenticatedUserApi(
      user._id,
      user.organization,
      updateData
    )
      .then((responseData) => {
        const newUser = { ...user, ...updateData };
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        dispatch(updateAuthenticatedUserSuccess(newUser, responseData.message));
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
            message: err.response.data.message,
            show: true,
            severity: "error",
          })
        );
      });
  };

  const makeClientCrop = async () => {
    setShowCrop(false);
    if (imageRef && crop.width && crop.height) {
      const croppedImageDataUrl = await getCroppedImg(
        imageRef.current,
        crop,
        "croppedImage.jpeg"
      );
      const formData = new FormData();
      formData.append("file", croppedImageDataUrl);
      formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
      formData.append("folder", "profiles");

      setProfileUploading(true);
      await cloudinaryImageUpload(formData)
        .then(async (responseData) => {
          const updateData = { profilePicture: responseData.secure_url };
          return await updateAuthenticatedUserApi(
            user._id,
            user.organization,
            updateData
          )
            .then((responseData) => {
              const newUser = { ...user, ...updateData };
              localStorage.setItem("currentUser", JSON.stringify(newUser));
              dispatch(
                updateAuthenticatedUserSuccess(newUser, responseData.message)
              );
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
                  message: err.response.data.message,
                  show: true,
                  severity: "error",
                })
              );
            });
        })
        .catch(() => {
          dispatch(
            updateMainAlert({
              message: "picture upload failed",
              show: true,
              severity: "error",
            })
          );
        });
      setProfileUploading(false);
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
          <div className={isDesktop ? classes.details : classes.detailsMini}>
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
            <Avatar className={classes.avatar} src={user.profilePicture} />
          </div>
        </CardContent>
        <Divider />
        <CardActions className={classes.buttonContainer}>
          <Button
            className={classes.uploadButton}
            color="primary"
            variant="text"
            onClick={onPictureUploadClick}
            disabled={profileUploading}
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
          <Button variant="text" onClick={handleRemoveImage}>
            Remove picture
          </Button>
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

export default usersStateConnector(AccountProfile);
