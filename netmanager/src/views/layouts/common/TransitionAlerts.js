import React from "react";
import { useDispatch } from "react-redux";
import { Collapse, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Alert from "@material-ui/lab/Alert";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useMainAlertData } from "redux/MainAlert/selectors";
import { hideMainAlert } from "redux/MainAlert/operations";


const useAlertStyles = makeStyles((theme) =>
  createStyles({
    alertRoot: {
      padding: "10px 100px",
      borderRadius: "unset",
    },
    alertExtraContent: {
      display: "flex",
      padding: "10px 100px",
      borderRadius: "unset",
      background: "#ffffff",
      border: "1px solid white",
      // color: "red",
      color: "#5b1615",
    },
    listStyle: {
      listStyleType: "square",
      listStylePosition: "outside",
      listStyleImage: "none",
    },
    root: {
      width: "100%",
      "& > * + *": {
        marginTop: theme.spacing(2),
      },
    },
  })
);

const TransitionAlerts = () => {
  const classes = useAlertStyles();
  const mainAlertData = useMainAlertData();
  const dispatch = useDispatch();

  return (
    <div className={classes.root}>
      <Collapse in={mainAlertData.show}>
        <Alert
          className={classes.alertRoot}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                dispatch(hideMainAlert());
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          severity={mainAlertData.severity}
        >
          {mainAlertData.message}
        </Alert>
        {mainAlertData.extra && mainAlertData.extra.length > 0 && (
          <div className={classes.alertExtraContent}>
            <ul>
              {mainAlertData.extra.map((value, key) => (
                <li style={{ textAlign: "left" }} key={key}>
                  {value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Collapse>
    </div>
  );
};

export default TransitionAlerts;
