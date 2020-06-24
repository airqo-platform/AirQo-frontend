/* eslint-disable */
import { connect, connectAdvanced } from 'react-redux';
import * as userActions from '../../../../redux/Join/actions';
import UserList from '../../../UserList/UserList';
import UsersTable from '../../../UserList/components/UsersTable/UsersTable';
import UsersToolBar from '../../../UserList/components/UsersToolbar/UsersToolbar';

import AccountDetails from 'views/Account/components/AccountDetails/AccountDetails';
import AccountProfile from 'views/Account/components/AccountProfile/AccountProfile';
import SettingsNotifications from 'views/Settings/components/Notifications/Notifications';
import SettingsPassword from 'views/Settings/components/Password/Password';
import SetDefaults from 'views/components/Users/SetDefaults';
import Dashboard from 'views/Dashboard/Dashboard';

import SideBar from 'layouts/Main/components/Sidebar/Sidebar';

import CandidateList from 'views/CandidateList/CandidateList';
import CandidatesTable from 'views/CandidateList/components/CandidatesTable/CandidatesTable';
import CandidatesToolBar from 'views/CandidateList/components/CandidatesToolbar/CandidatesToolbar';

// map state from store to props
const mapStateToProps = (state, ownProps) => {
  return {
    //you can now say this.props.mappedAppSate
    mappeduserState: state.userState,
    auth: state.auth,
    errors: state.errors
  };
};

// map actions to props
const mapDispatchToProps = dispatch => {
  return {
    //you can now say this.props.mappedAppActions
    fetchUsers: () => dispatch(userActions.fetchUsers()),
    fetchCandidates: () => dispatch(userActions.fetchCandidates()),
    fetchDefaults: userId => dispatch(userActions.fetchDefaults(userId)),

    fetchCollaborators: () => dispatch(userActions.fetchCollaborators()),

    mappedshowEditDialog: userToEdit =>
      dispatch(userActions.showEditDialog(userToEdit)),
    mappedhideEditDialog: () => dispatch(userActions.hideEditDialog()),
    mappedEditUser: userToEdit => dispatch(userActions.editUser(userToEdit)),

    mappedShowDeleteDialog: userToDelete =>
      dispatch(userActions.deleteUserDialog(userToDelete)),
    mappedHideDeleteDialog: () => dispatch(userActions.hideDeleteDialog()),
    mappedConfirmDeleteUser: userToDelete =>
      dispatch(userActions.deleteUser(userToDelete)),

    mappedShowConfirmDialog: userToConfirm =>
      dispatch(userActions.confirmUserDialog(userToConfirm)),
    mappedHideConfirmDialog: () => dispatch(userActions.hideConfirmDialog()),
    mappedApproveConfirmUser: userToConfirm =>
      dispatch(userActions.confirmUser(userToConfirm)),

    mappedAddUser: userToAdd => dispatch(userActions.addNewUser(userToAdd)),
    mappedShowAddDialog: () => dispatch(userActions.showAddDialog()),
    mappedHideAddDialog: () => dispatch(userActions.hideAddDialog())
  };
};

const containerCreator = connect(mapStateToProps, mapDispatchToProps);

// const components = [UserList, UsersTable];

const connectedUserList = containerCreator(UserList);

const connectedUsersTable = containerCreator(UsersTable);

const connectedUsersToolbar = containerCreator(UsersToolBar);

export { connectedUserList, connectedUsersTable, connectedUsersToolbar };
// export default containerCreator(UserList);

const connectedDashboard = containerCreator(Dashboard);

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
  connectedSetDefaults,
  connectedSideBar,
  connectedDashboard
};
