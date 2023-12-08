import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MapContainer from '../pages/Heatmap/HeatMapOverlay';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import Main from './Main';

class Landing extends Component {
  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/analytics');
    }
  }

  render() {
    return (
      <Main>
        <MapContainer />
      </Main>
    );
  }
}

Landing.propTypes = {
  auth: PropTypes.object.isRequired
};
const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, {})(Landing);
