import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
const SidebarOptions = ({
  layout: Layout,
  component: Component,
  auth,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      auth.isNetManager === true ? (
        //   side bar with netmanager tools
        <Layout>
          <Component {...props} />
        </Layout>
      ) : (
        //   side bar without netmanager
        <Redirect to="/login" />
      )
    }
  />
);
SidebarOptions.propTypes = {
  auth: PropTypes.object.isRequired,
  layout: PropTypes.any.isRequired,
  path: PropTypes.string,
};
const mapStateToProps = (state) => ({
  auth: state.auth,
});
//
export default connect(mapStateToProps)(SidebarOptions);
