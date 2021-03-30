// map state from store to props
import * as userActions from "../../redux/Join/actions";
import { connect } from "react-redux";

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

export default connect(mapStateToProps, mapDispatchToProps);
