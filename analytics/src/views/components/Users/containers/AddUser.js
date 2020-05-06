// ./react-redux-client/src/containers/App.js
import { connect } from "react-redux";
import AddUser from "../AddUser";
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
        mappedToggleAddUser: () => dispatch(userActions.toggleAddUser()),
        mappedAddUser: user => dispatch(userActions.addNewUser(user))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddUser);