import React, { useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  spacer: {
    flexGrow: 1,
  },
  importButton: {
    marginRight: theme.spacing(1),
  },
  exportButton: {
    marginRight: theme.spacing(1),
  },
  searchInput: {
    marginRight: theme.spacing(1),
  },
  link: {
    color: "#3344FF",
    marginRight: theme.spacing(1),
    fontWeight: "bold",
  },
}));

const SiteToolbar = (props) => {
  const { className, ...rest } = props;

  const classes = useStyles();

  const initSiteData = {
    latitude: "",
    longitude: "",
    name: "",
  };

  const [open, setOpen] = useState(false);
  const [siteData, setSiteData] = useState(initSiteData);

  const handleRegisterClose = () => {
    setOpen(false);
    setSiteData(initSiteData);
  };

  const handleSiteDataChange = (key) => (event) => {
    if (key === "phoneNumber") {
      let re = /\s*|\d+(\.d+)?/;
      if (!re.test(event.target.value)) {
        return;
      }
    }
    return setSiteData({ ...siteData, [key]: event.target.value });
  };

  const handleSiteSubmit = (e) => {};

  return (
    <>
      <div {...rest} className={clsx(classes.root, className)}>
        <div className={classes.row}>
          <span className={classes.spacer} />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            align="centre"
            onClick={() => setOpen(!open)}
          >
            {" "}
            Add Site
          </Button>
        </div>
      </div>
      <Dialog
        open={open}
        onClose={handleRegisterClose}
        aria-labelledby="form-dialog-title"
        aria-describedby="form-dialog-description"
      >
        <DialogTitle
          id="form-dialog-title"
          style={{ textTransform: "uppercase" }}
        >
          Add a site
        </DialogTitle>

        <DialogContent>
          <form className={classes.modelWidth}>
            <TextField
              autoFocus
              margin="dense"
              label="Site Name"
              variant="outlined"
              value={siteData.name}
              onChange={handleSiteDataChange("name")}
              fullWidth
              required
              // error={!!errors.long_name}
              // helperText={errors.long_name}
            />
            <TextField
              autoFocus
              margin="dense"
              label="Longitude"
              variant="outlined"
              value={siteData.longitude}
              onChange={handleSiteDataChange("longitude")}
              // error={!!errors.description}
              // helperText={errors.description}
              fullWidth
              required
            />
            <TextField
              autoFocus
              margin="dense"
              label="Latitude"
              variant="outlined"
              value={siteData.latitude}
              onChange={handleSiteDataChange("latitude")}
              // error={!!errors.generation_version}
              // helperText={errors.generation_version}
              fullWidth
              required
            />
          </form>
        </DialogContent>

        <DialogActions>
          <Grid
            container
            alignItems="flex-end"
            alignContent="flex-end"
            justify="flex-end"
          >
            <Button
              variant="contained"
              type="button"
              onClick={handleRegisterClose}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={handleSiteSubmit}
              style={{ margin: "0 15px" }}
            >
              Create Site
            </Button>
          </Grid>
          <br />
        </DialogActions>
      </Dialog>
    </>
  );
};

SiteToolbar.propTypes = {
  className: PropTypes.string,
};

export default SiteToolbar;
