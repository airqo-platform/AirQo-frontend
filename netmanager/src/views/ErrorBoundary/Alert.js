import React from "react";
import Alert from "@material-ui/lab/Alert";
import { Collapse } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  boundaryAlert: {
    border: "1px solid #e74b47",
    margin: "25px 25px 5px 25px",
    fontSize: "40px",
    "& .MuiAlert-icon": {
      fontSize: 40,
    },
  },
});

function BoundaryAlert(props) {
  const classes = useStyles();
  return (
    <Collapse in={true}>
      <Alert className={classes.boundaryAlert} severity="error">
        {props.title && <div className="title">{props.title}</div>}
      </Alert>
      <div className="details">{props.children}</div>
    </Collapse>
  );
}

export default BoundaryAlert;
