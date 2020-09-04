/* eslint-disable */
import { connect, connectAdvanced } from "react-redux";
import * as userActions from "redux/Join/actions";
import UserList from "views/pages/UserList/UserList";
import UsersTable from "views/pages/UserList/components/UsersTable/UsersTable";
import UsersToolBar from "views/pages/UserList/components/UsersToolbar/UsersToolbar";

import { AccountDetails, AccountProfile } from "views/pages/Account/components";
import SettingsNotifications from "views/pages/Settings/components/Notifications/Notifications";
import SettingsPassword from "views/pages/Settings/components/Password/Password";
import Dashboard from "views/pages/Dashboard/Dashboard";
import SideBar from "views/layouts/Main/components/Sidebar/Sidebar";
import CandidateList from "views/pages/CandidateList/CandidateList";
import CandidatesTable from "views/pages/CandidateList/components/CandidatesTable/CandidatesTable";
import CandidatesToolBar from "views/pages/CandidateList/components/CandidatesToolbar/CandidatesToolbar";

import { SignUp, Register, Login } from "views/pages/SignUp";

import { SignIn } from "views/pages/SignIn";

// map state from store to props
const mapStateToProps = (state, ownProps) => {
  return {
    mappeduserState: state.userState,
    mappedAuth: state.auth,
    mappedErrors: state.errors,
  };
};

// map actions to props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchUsers: () => dispatch(userActions.fetchUsers()),
    fetchCandidates: () => dispatch(userActions.fetchCandidates()),
    fetchDefaults: (userId) => dispatch(userActions.fetchDefaults(userId)),

    mappedshowEditDialog: (userToEdit) =>
      dispatch(userActions.showEditDialog(userToEdit)),
    mappedhideEditDialog: () => dispatch(userActions.hideEditDialog()),
    mappedEditUser: (userToEdit) => dispatch(userActions.editUser(userToEdit)),

    mappedShowDeleteDialog: (userToDelete) =>
      dispatch(userActions.deleteUserDialog(userToDelete)),
    mappedHideDeleteDialog: () => dispatch(userActions.hideDeleteDialog()),
    mappedConfirmDeleteUser: (userToDelete) =>
      dispatch(userActions.deleteUser(userToDelete)),

    mappedShowConfirmDialog: (userToConfirm) =>
      dispatch(userActions.confirmUserDialog(userToConfirm)),
    mappedHideConfirmDialog: () => dispatch(userActions.hideConfirmDialog()),
    mappedApproveConfirmUser: (userToConfirm) =>
      dispatch(userActions.confirmUser(userToConfirm)),

    mappedAddUser: (userToAdd) => dispatch(userActions.addNewUser(userToAdd)),
    mappedShowAddDialog: () => dispatch(userActions.showAddDialog()),
    mappedHideAddDialog: () => dispatch(userActions.hideAddDialog()),

    mappedUpdateAuthenticatedUser: (userToUpdate) =>
      dispatch(userActions.updateAuthenticatedUser(userToUpdate)),

    mappedUpdatePassword: (userToUpdate) =>
      dispatch(userActions.updatePassword(userToUpdate)),
  };
};

const containerCreator = connect(mapStateToProps, mapDispatchToProps);

const connectedUserList = containerCreator(UserList);

const connectedUsersTable = containerCreator(UsersTable);

const connectedUsersToolbar = containerCreator(UsersToolBar);

const connectedCandidateList = containerCreator(CandidateList);

const connectedCandidatesTable = containerCreator(CandidatesTable);

const connectedCandidatesToolbar = containerCreator(CandidatesToolBar);

const connectedAccountsDetails = containerCreator(AccountDetails);

const connectedAccountProfile = containerCreator(AccountProfile);

const connectedSettingsNotifications = containerCreator(SettingsNotifications);

const connnectedSettingsPassword = containerCreator(SettingsPassword);

const connectedSideBar = containerCreator(SideBar);

const connectedDashboard = containerCreator(Dashboard);

const connectedRegister = containerCreator(Register);

const connectedSignUp = containerCreator(SignUp);

const connectedLogin = containerCreator(Login);

const connectedSignIn = containerCreator(SignIn);

export {
  connectedUserList,
  connectedUsersTable,
  connectedUsersToolbar,
  connectedCandidateList,
  connectedCandidatesTable,
  connectedCandidatesToolbar,
  connectedAccountsDetails,
  connectedAccountProfile,
  connectedSettingsNotifications,
  connnectedSettingsPassword,
  connectedSideBar,
  connectedDashboard,
  connectedSignUp,
  connectedRegister,
  connectedLogin,
  connectedSignIn,
};
