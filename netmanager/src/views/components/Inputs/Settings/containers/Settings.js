/* eslint-disable */
import { connect, connectAdvanced } from "react-redux";
import * as userActions from "../../../../redux/Join/actions";

import Account from "views/components/Inputs/Settings/components/Account";
import Settings from "views/components/Inputs/Settings/components/Settings";
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
    fetchDefaults: (userId) => dispatch(userActions.fetchDefaults(userId)),

    mappedUpdateAuthenticatedUser: (userToUpdate) =>
      dispatch(userActions.updateAuthenticatedUser(userToUpdate)),

    mappedUpdatePassword: (userToUpdate) =>
      dispatch(userActions.updatePassword(userToUpdate)),

    mappedSetDefaults: (defaultSettings) =>
      dispatch(userActions.setDefaults(defaultSettings)),

    mappedResetPassword: (token) => dispatch(userActions.resetPassword(token)),

    mappedForgotPassword: (data) => dispatch(userActions.forgotPassword(data)),

    mappedLoginUser: (data) => dispatch(userActions.loginUser(data)),

    mappedLogoutUser: () => {
      dispatch(userActions.logoutUser());
    },
  };
};

const containerCreator = connect(mapStateToProps, mapDispatchToProps);

const connectedAccounts = containerCreator(Account);

const connectedSettings = containerCreator(Settings);

const connectedSideBar = containerCreator(SideBar);

export { connectedAccounts, connectedSettings, connectedSideBar };
