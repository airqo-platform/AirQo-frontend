import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Grid } from "@material-ui/core";
import AccountDetails from "./components/AccountDetails";
import AccountProfile from "./components/AccountProfile";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
}));

const Account = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={4}>
        <Grid item lg={6} md={6} xl={4} xs={12}>
          <AccountProfile />
        </Grid>
        <Grid item lg={6} md={6} xl={8} xs={12}>
          <AccountDetails />
        </Grid>
      </Grid>
    </div>
  );
};

export default Account;
