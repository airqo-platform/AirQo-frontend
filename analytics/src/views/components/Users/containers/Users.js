import { connect } from "react-redux";
import * as userActions from "../../../../redux/Join/actions";
import Users from "../Users";

// map state from store to props
const mapStateToProps = (state, ownProps) => {
    return {
        //you can now say this.props.mappedAppSate
        mappeduserState: state.userState
    };
};

// map actions to props
const mapDispatchToProps = dispatch => {
    return {
        //you can now say this.props.mappedAppActions
        fetchUsers: () => dispatch(userActions.fetchUsers()),

        mappedshowEditDialog: userToEdit => dispatch(userActions.showEditDialog(userToEdit)),
        mappedhideEditDialog: () => dispatch(userActions.hideEditDialog()),
        mappedEditUser: userToEdit => dispatch(userActions.editUser(userToEdit)),

        mappedShowDeleteDialog: userToDelete => dispatch(userActions.deleteUserDialog(userToDelete)),
        mappedHideDeleteDialog: () => dispatch(userActions.hideDeleteDialog()),
        mappedConfirmDeleteUser: userToDelete => dispatch(userActions.deleteUser(userToDelete)),

        mappedShowConfirmDialog: (userToConfirm) => dispatch(userActions.confirmUserDialog(userToConfirm)),
        mappedHideConfirmDialog: () => dispatch(userActions.hideConfirmDialog()),
        mappedApproveConfirmUser: (userToConfirm) => dispatch(userActions.confirmUser(userToConfirm))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Users);