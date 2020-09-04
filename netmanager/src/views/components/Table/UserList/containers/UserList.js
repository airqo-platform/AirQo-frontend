/* eslint-disable */
import { connect } from "react-redux";
import * as userActions from "../../../../redux/Join/actions";
import UserList from "../../../UserList/UserList";
import UsersTable from "../../../UserList/components/UsersTable/UsersTable";
import UsersToolBar from "../../../UserList/components/UsersToolbar/UsersToolbar";

import SideBar from "layouts/Main/components/Sidebar/Sidebar";

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
  };
};

const containerCreator = connect(mapStateToProps, mapDispatchToProps);

const connectedUserList = containerCreator(UserList);

const connectedUsersTable = containerCreator(UsersTable);

const connectedUsersToolbar = containerCreator(UsersToolBar);

const connectedSideBar = containerCreator(SideBar);

export {
  connectedUserList,
  connectedUsersTable,
  connectedUsersToolbar,
  connectedSideBar,
};
