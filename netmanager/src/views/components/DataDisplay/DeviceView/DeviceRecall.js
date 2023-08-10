// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { isEmpty, isEqual } from 'underscore';
// import usersStateConnector from 'views/stateConnectors/usersStateConnector';

// import { useOrgData } from 'redux/Join/selectors';
// import { recallDeviceApi } from '../../../apis/deviceRegistry';
// import { updateAuthenticatedUserSuccess, getUserDetails } from 'redux/Join/actions';
// import { updateMainAlert } from 'redux/MainAlert/operations';
// import { loadDevicesData } from 'redux/DeviceRegistry/operations';
// import { loadSitesData } from 'redux/SiteRegistry/operations';
// import { 
//     Button, 
//     CircularProgress, 
//     Grid, 
//     Paper, 
//     TextField,
//     Dialog,
//     DialogActions,
//     DialogContent,
//     DialogContentText,
//     DialogTitle,
//     Select,
//     MenuItem
  
// } from '@material-ui/core';

// const RecallDeviceDialog = ({ deviceData, handleRecall, open, toggleOpen }) => {
//     const [recallType, setRecallType] = useState('');
  
//     const handleConfirmRecall = () => {
//       // Call handleRecall with the selected recallType
//       handleRecall(recallType);
//       // Close the dialog
//       toggleOpen();
//     };
  
//     return (
//       <Dialog open={open} onClose={toggleOpen} aria-labelledby="form-dialog-title">
//         <DialogTitle id="form-dialog-title">Recall Device</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Select the recall type for device {deviceData.name}.
//           </DialogContentText>
//           <Select
//             value={recallType}
//             onChange={(e) => setRecallType(e.target.value)}
//             fullWidth
//           >
//             <MenuItem value="">Select Recall Type</MenuItem>
//             <MenuItem value="Type A">Type A</MenuItem>
//             <MenuItem value="Type B">Type B</MenuItem>
//             <MenuItem value="Type C">Type C</MenuItem>
//           </Select>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={toggleOpen} color="primary">
//             Cancel
//           </Button>
//           <Button onClick={handleConfirmRecall} color="primary">
//             Recall
//           </Button>
//         </DialogActions>
//       </Dialog>
//     );
//   };

//   RecallDeviceDialog.propTypes = {
//     deviceData: PropTypes.object.isRequired,
//     handleRecall: PropTypes.func.isRequired,
//     open: PropTypes.bool.isRequired,
//     toggleOpen: PropTypes.func.isRequired
//   };

// const deviceRecallSubmit = async (deviceData) => {
//     const [recallLoading, setrecallLoading] = useState(false);
//     const [recallOpen, setRecallOpen] = useState(false);
//     const [recallType, setRecallType] = useState('');

//     const { user } = mappedAuth;

//     const classes = useStyles();
//     const [loading, setLoading] = useState(false);
//     const dispatch = useDispatch();
//     const alertInitialState = {
//         show: false,
//         message: '',
//         type: 'success'
//     };
    
//     const [alert, setAlert] = useState(alertInitialState);
  
//     let initialState = {};

//     const [form, setState] = useState(initialState);

//     useEffect(() => {
//         if (!isEmpty(user)) {
//           getUserDetails(user._id).then((res) => {
//             initialState = {
//                 userName: res.users[0].email,
//                 firstName: res.users[0].firstName,
//                 lastName: res.users[0].lastName,
//                 email: res.users[0].email,
              
//             };
    
//             setState(initialState);
//           });
//         }
//       }, []);
//     const clearState = () => {
//         setState({ ...initialState });
//     };

//         setRecallOpen(false); 
//         setrecallLoading(true);

//         const userId = user._id;

//         setLoading(true);
//         await getUserDetails(userId, form)
//         .then((data) => {
//             if (data.success) {
//             const newUser = { ...user, ...form };
//             localStorage.setItem('currentUser', JSON.stringify(newUser));
//             dispatch(updateAuthenticatedUserSuccess(newUser, data.message));
//             setAlert({
//                 show: true,
//                 message: data.message,
//                 type: 'success'
//             });
//             return;
//         }
//             setAlert({
//             show: true,
//             message: data.message,
//             type: 'error'
//             });
//         })
//         .catch((err) => {
//             setAlert({
//             show: true,
//             message: err.response.data.message,
//             type: 'error'
//             });
//             clearState();
//         });
//         setLoading(false);
      
//         try {
//           const recallData = {
//             recallType: recallType,
//             userName: form.email, 
//             email: form.email,
//             firstName: form.firstName,
//             lastName: form.lastName
//           };
      
//           const responseData = await recallDeviceApi(deviceData.name, recallData); 
      
//           const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
//           if (!isEmpty(activeNetwork)) {
//             dispatch(loadDevicesData(activeNetwork.net_name));
//             dispatch(loadSitesData(activeNetwork.net_name));
//           }
      
//           dispatch(
//             updateMainAlert({
//               message: responseData.message,
//               show: true,
//               severity: 'success'
//             })
//           );
//         } catch (err) {
//           dispatch(
//             updateMainAlert({
//               message: err.response && err.response.data && err.response.data.message,
//               show: true,
//               severity: 'error'
//             })
//           );
//         }
      
//         setrecallLoading(false);
// };

// export default deviceRecallSubmit;
