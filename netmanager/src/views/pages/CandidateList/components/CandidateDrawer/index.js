import { Box, Button, Drawer, Typography, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: '300px',
    padding: '12px'
  }
}));

const CandidateDrawer = ({
  drawerCandidate,
  showFullDescription,
  onDenyBtnClick,
  isLoading,
  modifyCandidate,
  onConfirmBtnClick,
  toggleDrawer
}) => {
  const classes = useStyles();
  return (
    <Drawer anchor={'right'} open={showFullDescription} onClose={toggleDrawer}>
      {drawerCandidate && (
        <div className={classes.drawer}>
          <Typography variant="h6">Name</Typography>
          <Typography variant="body1">
            {drawerCandidate.firstName} {drawerCandidate.lastName}
          </Typography>
          <Typography variant="h6">Email</Typography>
          <Typography variant="body1">{drawerCandidate.email}</Typography>
          <Typography variant="h6">Description</Typography>
          <Typography variant="body1">{drawerCandidate.description}</Typography>
          <Typography variant="h6">Status</Typography>
          <Typography variant="body1">{drawerCandidate.status}</Typography>
          <Typography variant="h6">Organization</Typography>
          <Typography variant="body1">{drawerCandidate.long_organization}</Typography>
          <Typography variant="h6">Job title</Typography>
          <Typography variant="body1">{drawerCandidate.jobTitle}</Typography>
          <Typography variant="h6">Submitted on</Typography>
          <Typography variant="body1">{drawerCandidate.createdAt}</Typography>

          <Box marginTop={'15px'} marginBottom={'15px'} display={'flex'}>
            <Button
              fullWidth
              disabled={drawerCandidate.status === 'rejected'}
              color="primary"
              onClick={onConfirmBtnClick}
            >
              Confirm
            </Button>
            {drawerCandidate.status === 'rejected' ? (
              <Button fullWidth style={{ color: 'orange' }} onClick={modifyCandidate}>
                Revert
              </Button>
            ) : (
              <Button
                fullWidth
                disabled={isLoading}
                style={{ color: 'red' }}
                onClick={onDenyBtnClick}
              >
                Reject
              </Button>
            )}
          </Box>
        </div>
      )}
    </Drawer>
  );
};

export default CandidateDrawer;
