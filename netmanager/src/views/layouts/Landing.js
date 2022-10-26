import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AlertMinimal from './AlertsMininal';
import AirQoLogo from 'assets/img/icons/airqo_logo.png';

class Landing extends Component {
  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/dashboard');
    }
  }

  render() {
    return (
      <AlertMinimal>
        <div
          style={{
            position: 'relative',
            height: '100vh'
          }}>
          <div
            className="container valign-wrapper"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignContent: 'center',
              position: 'absolute',
              margin: '0 auto',
              bottom: 0,
              top: 0,
              right: 0,
              left: 0
            }}>
            <div style={{ backgroundColor: '#0078ff', borderRadius: '4px' }}>
              <img src={AirQoLogo} alt="Logo" height={200} />
            </div>
            <div className="row">
              <div className="col s12 center-align">
                <br />
                <div className="col s6">
                  <Link
                    to="/request-access"
                    style={{
                      width: '180px',
                      borderRadius: '3px'
                    }}
                    className="btn btn-large waves-effect waves-light grey white-text">
                    REQUEST ACCESS
                  </Link>
                </div>
                <div className="col s6">
                  <Link
                    to="/login"
                    style={{
                      width: '180px',
                      borderRadius: '3px'
                    }}
                    className="btn btn-large waves-effect blue accent-3 white-text hoverable">
                    LOGIN
                  </Link>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col s12 center-align" style={{ marginTop: '60px', textTransform:'uppercase', letterSpacing:'1.2px' }}>
                <h4 style={{ color: '#0078ff', fontSize:'48px', fontWeight:'600', opacity:'0.6' }}> The AirQo Analytics Platform</h4>
              </div>
            </div>
          </div>
        </div>
      </AlertMinimal>
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
