import React from "react";
import { Button, Dialog } from "@material-ui/core";

import "assets/scss/confirm-dialog.sass";

const ConfirmDialog = ({
  open,
  close,
  confirmBtnMsg,
  confirm,
  title,
  message,
  error,
}) => {
  let style = { background: "#2f67e2", color: "white" };
  if (error) {
    style = { background: "#c00", color: "white" };
  }
  return (
    <Dialog
      open={open}
      onClose={close}
      aria-labelledby="confirm-dialog-title-del"
      aria-describedby="confirm-dialog-description"
      classes={"confirm-dialog"}
    >
      <div className={"confirm-dialog"}>
        <div className={"confirm-dialog-title"}>{title}</div>
        <div className={"confirm-dialog-message"}>{message}</div>
        <div className={"confirm-dialog-controls"}>
          <Button
            variant="contained"
            // style={{ background: "#c6d1db" }}
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            onClick={confirm}
            style={style}
          >
            {confirmBtnMsg || "Delete"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
