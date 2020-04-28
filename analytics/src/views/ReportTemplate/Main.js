import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { Divider, Drawer, Button } from "@material-ui/core";
import PictureAsPdfSharpIcon from "@material-ui/icons/PictureAsPdfSharp";
import SaveIcon from "@material-ui/icons/Save";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import Pdf from "react-to-pdf";

import { Card, CardContent } from "@material-ui/core";
// import InsertChartIcon from '@material-ui/icons/InsertChartOutlined';

const useStyles = makeStyles(theme => ({
  root: {
    height: "100%",
    fontFamily: "Helvetica Neue",
    lineHeight: "1.5em"
  },
  content: {
    alignItems: "center",
    display: "flex"
  },
  title: {
    fontWeight: 700,
    textAlign: "center",
    lineHeight: "3em"
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    height: 56,
    width: 56
  },
  icon: {
    height: 32,
    width: 32
  },
  progress: {
    marginTop: theme.spacing(3)
  },
  divider: {
    margin: theme.spacing(2, 0)
  },
  picarea: {
    width: "50%",
    height: 300,
    margin: "auto 0",
    border: "1px dotted #888"
  },
  load_draft: {
    width: "auto",
    margin: "auto"
  }
}));
function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}

const ref = React.createRef();

const Main = props => {
  const { className, ...rest } = props;

  const classes = useStyles();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const d = new Date();

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <Pdf
        targetRef={ref}
        filename={
          "air-quality-report-" +
          monthNames[d.getMonth()] +
          "-" +
          d.getFullYear() +
          ".pdf"
        }
      >
        {({ toPdf }) => (
          <Button
            color="primary"
            variant="outlined"
            endIcon={<PictureAsPdfSharpIcon />}
            onClick={toPdf}
          >
            Generate Pdf
          </Button>
        )}
      </Pdf>
      <Button
        color="primary"
        variant="outlined"
        endIcon={<SaveIcon />}
        onClick=""
      >
        Save Draft
      </Button>
      <Button
        color="primary"
        variant="outlined"
        endIcon={<CloudDownloadIcon />}
        onClick={handleClickOpen}
      >
        Load Draft
      </Button>
      <CardContent>
        <div ref={ref}>
          <div className={classes.progress}></div>
          <Divider className={classes.divider} />
          <h1 className={classes.title}>KCCA MONTHLY AIR QUALITY REPORT</h1>
          <h3 className={classes.title}>
            {monthNames[d.getMonth()]}, {d.getFullYear()}{" "}
          </h3>
          <Divider className={classes.divider} />
          <p>
            Welcome to the KCCA Air QUality Report for the month of{" "}
            {monthNames[d.getMonth()]}, {d.getFullYear()}. This report is
            generated monthly by the Directorate of Air Quality and is intended
            to provide an insight into the changes in air quality across the
            city and in specific locations and explore their possible causes and
            consequences.
          </p>
          <div className={classes.progress}></div>
          <p>
            KCCA has over 25 air quality and weather monitoring devices across
            the city and in partnership with AirQo and US EMbassy access to many
            more sources of air quality data.
          </p>
          <h3 className={classes.progress}>
            Citywide air quality trends over the month{" "}
          </h3>
          <br />
          <div className={classes.picarea}></div>
          <p>
            As we make the transition to the wet season we have had an increase
            in air quality across the city. We have also seen improvements as a
            result of the lockdown wich have again improved
          </p>
          <h3>District by district variation over the month</h3>
          <div className={classes.picarea}></div>
          <p>
            The ongoing roadworks that have taken place in Kawempe mean that
            this is somewhat higher than the other districts. This can be seen
            in the following chart for the second week where a significant
            difference change is seen on device 21
          </p>
          <h3 className={classes.progress}>
            Story of the week, <br />A local school this week rhubarb rhubarb
            rhubarb rhubarb rhubarb rhubarb rhubarb rhubarb rhubarb. All thanks
            to AirQo
          </h3>
          <div className={classes.picarea}></div>

          <Button
            color="primary"
            variant="outlined"
            className={classes.progress}
          >
            Join us next month for more of the same
          </Button>
        </div>
      </CardContent>
      <Dialog open={open} onClose={handleClose} className={classes.load_draft}>
        <DialogTitle>Draft Templates</DialogTitle>
        <DialogContent>
          <List component="nav" aria-label="secondary mailbox folders">
            <ListItem button>
              <ListItemText primary="air-quality-report-04-2020-v1" />
            </ListItem>
            <ListItemLink href="#simple-list">
              <ListItemText primary="air-quality-report-04-2020-v2" />
            </ListItemLink>
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            variant="contained"
            onClick={handleClose}
            color="primary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

Main.propTypes = {
  className: PropTypes.string
};

export default Main;
