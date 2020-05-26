// ./react-redux-client/src/containers/App.js
import { connect } from "react-redux";
import SetDefaults from "../SetDefaults";
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
        mappedSetDefaults: user => dispatch(userActions.setDefaults(user))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SetDefaults);