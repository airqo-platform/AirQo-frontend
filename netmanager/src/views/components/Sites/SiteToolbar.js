import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import { SearchInput } from "../SearchInput";
import { CSVLink, CSVDownload } from "react-csv";

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

  return (
    <div {...rest} className={clsx(classes.root, className)}>
      <div className={classes.row}>
        <span className={classes.spacer} />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          align="centre"
          disabled
        >
          {" "}
          Add Site
        </Button>
      </div>
    </div>
  );
};

SiteToolbar.propTypes = {
  className: PropTypes.string,
};

export default SiteToolbar;
