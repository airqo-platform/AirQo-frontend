import React, { useState, useEffect } from 'react';
import Alert from '@material-ui/lab/Alert';
import { CircularLoader } from 'views/components/Loader/CircularLoader';
import PropTypes from 'prop-types';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CloseIcon from '@material-ui/icons/Close';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import { makeStyles } from '@material-ui/core/styles';
import { generateAccessTokenForUserApi } from '../../../../apis/accessControl';
import {
  Card,
  CardHeader,
  Divider,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2)
  },
  DialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  DialogContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '380px'
  },
  DialogActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  DialogButton: {
    margin: theme.spacing(1)
  },
  DialogButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
}));

const RegisterClient = (props) => {
  const classes = useStyles();
  const { open, onClose } = props;
  const [clientName, setClientName] = useState('');

  const handleSubmit = () => {
    // handle submission of client name here
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.DialogTitle}>Register Client</DialogTitle>
      <DialogContent className={classes.DialogContent}>
        <TextField
          label="Client Name"
          value={clientName}
          variant="outlined"
          onChange={(e) => setClientName(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions className={classes.DialogActions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleSubmit}
          className={classes.DialogButton}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const GenerateToken = (props) => {
  const { className, mappedAuth, ...rest } = props;
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Card
        style={{
          margin: '30px 0'
        }}>
        <CardHeader
          title="API Access"
          subheader="Register your application to get an API access token."
        />
        <Divider />

        <CardActions>
          <Button color="primary" variant="outlined" onClick={handleOpen}>
            Register Client
          </Button>
        </CardActions>
      </Card>
      <RegisterClient open={open} onClose={handleClose} />
    </>
  );
};

GenerateToken.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
  mappeduserState: PropTypes.object.isRequired
};

export default usersStateConnector(GenerateToken);
