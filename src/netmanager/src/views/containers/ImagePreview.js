import React from "react";
import { Dialog } from "@material-ui/core";

import "assets/scss/confirm-dialog.sass";

const ImagePreview = ({ open, src, close }) => {
  return (
    <Dialog
      open={open}
      onClose={close}
      aria-labelledby="image-preview-title"
      aria-describedby="image-preview-description"
      maxWidth={"lg"}
    >
      <div className={"full-image-preview"}>
        <img className={"image"} src={src || ""} alt={"image"} />
      </div>
    </Dialog>
  );
};

export default ImagePreview;
