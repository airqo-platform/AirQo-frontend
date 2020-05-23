/* eslint-disable */
import { connect } from "react-redux";
import * as userActions from "../../../../redux/Join/actions";
import UserList from "../../../UserList/UserList";
import UsersTable from "../../../UserList/components/UsersTable/UsersTable";
import mockData from '../../../UserList/data';
import UsersToolBar from "../../../UserList/components/UsersToolbar/UsersToolbar"

// map state from store to props
const mapStateToProps = (state, ownProps) => {
    return {
        //you can now say this.props.mappedAppSate
        mappeduserState: state.userState,
        auth: state.auth,
        errors: state.errors,
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
        mappedApproveConfirmUser: (userToConfirm) => dispatch(userActions.confirmUser(userToConfirm)),

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

// export default connect(mapStateToProps, mapDispatchToProps)(UserList)