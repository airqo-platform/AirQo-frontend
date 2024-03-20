import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from '../../ErrorBoundary';
import { Box, Button, Typography, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import AddGridToolbar from './AddGridForm';
import GridsTable from './GridsTable';
import BreadCrumb from './breadcrumb';
import { withPermission } from '../../containers/PageAccess';
import { fetchGridsSummary } from 'redux/Analytics/operations';
import { LargeCircularLoader } from '../../components/Loader/CircularLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const GridsRegistry = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const grids = useSelector((state) => state.analytics.gridsSummary);

  useEffect(() => {
    setLoading(true);
    const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});
    dispatch(fetchGridsSummary(activeNetwork.net_name)).then(() => {
      setLoading(false);
    });
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  if (loading) {
    return (
      <Box
        height={'60vh'}
        width={'100%'}
        color="blue"
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}>
        <LargeCircularLoader loading={loading} />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <AddGridToolbar open={open} handleClose={handleClose} />
        <BreadCrumb>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Create grid
          </Button>
        </BreadCrumb>
        <div className={classes.content}>
          {grids && grids.length > 0 ? (
            <GridsTable gridsList={grids} />
          ) : (
            <Box
              height={'100px'}
              textAlign={'center'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}>
              <Typography variant="body2" color="textSecondary">
                No grids found
              </Typography>
            </Box>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default withPermission(GridsRegistry, 'CREATE_UPDATE_AND_DELETE_AIRQLOUDS');
