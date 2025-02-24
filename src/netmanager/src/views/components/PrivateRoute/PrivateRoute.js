import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
const PrivateRoute = ({
  layout: Layout,
  component: Component,
  auth,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      auth.isAuthenticated === true ? (
        <Layout>
          <Component {...props} />
        </Layout>
      ) : (
        <Redirect to="/login" />
      )
    }
  />
);
PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
  layout: PropTypes.any.isRequired,
  path: PropTypes.string,
};
const mapStateToProps = (state) => ({
  auth: state.auth,
});
//
export default connect(mapStateToProps)(PrivateRoute);
