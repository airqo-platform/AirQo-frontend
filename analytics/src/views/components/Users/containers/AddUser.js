// ./react-redux-client/src/containers/App.js
import { connect } from "react-redux";
import AddUser from "../../../UserList/components/UsersToolbar/UsersToolbar";
import * as userActions from "../../../../redux/Join/actions";


// map state from store to props
const mapStateToProps = state => {
    return {
        //you can now say this.props.mappedAppSate
        mappedAppState: state.userState
    };
};

// map actions to props
const mapDispatchToProps = dispatch => {
    return {
        //you can now say this.props.mappedAppActions
        mappedshowAddDialog: () => dispatch(userActions.showAddDialog()),
        mappedAddUser: user => dispatch(userActions.addNewUser(user))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddUser);