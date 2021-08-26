/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { forgotPassword } from "../../../redux/Join/actions";
import { Link, withRouter } from "react-router-dom";
import classnames from "classnames";
import { forgotPasswordResetApi } from "../../apis/authService";
import Alert from "@material-ui/lab/Alert";
import { CardContent } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import AlertMinimal from "../../layouts/AlertsMininal";

const title = {
  pageTitle: "Forgot Password Screen",
};

class ForgotPassword extends Component {
  constructor() {
    super();

    this.state = {
      email: "",
      organisation: "",
      showError: false,
      messageFromServer: "",
      errors: {},
      alert: {
        show: false,
        message: "",
        type: "error"
      },
    };
  }

  async componentDidMount() {
    var anchorElem = document.createElement('link');
    anchorElem.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css');
    anchorElem.setAttribute('rel','stylesheet') ;
    anchorElem.setAttribute('id','logincdn') ;
    document.getElementsByTagName('head')[0].appendChild(anchorElem);
  }

  componentWillUnmount(){
    let el = document.getElementById('logincdn');
    el.remove(); 
  }

  onAlertClose = () => {
    this.setState({
      ...this.state,
      alert: { ...this.state.alert, show: false }
    })
  }

  setAlert = (alert) => {
    this.setState({
      ...this.state,
      alert
    })
  }

  onChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value,
    });
  };

  onSubmit = async (e) => {
    e.preventDefault();
    const { email, organisation } = this.state;
    const userData = {
      email,
      organisation,
    };

    await forgotPasswordResetApi(userData)
        .then(responseData => {
          this.setAlert({
            show: true,
            message: responseData.message,
            type: "success"
          })
          this.setState({
            email: "",
            organisation: "",
          })
        })
        .catch(err => {
          this.setAlert({
            show: true,
            message: err.response && err.response.data.message || err.request && "Please check your internet connectivity",
            type: "error"
          })
        });
  };

  render() {
    const { errors } = this.state;

    return (
        <AlertMinimal>
          <div className="container"
             style={{
              maxWidth: "1000px",
              marginTop: "4rem",
              backgroundColor: "#fff",
            }}>
            <Grid container>
              <Grid
                item
                xs={12}
                sm={4}
                style={{
                  padding: "1em",
                  backgroundColor: "#3067e2",
                  height: "100% !important",
                  minHeight: "100px",
                }}
              />
              <Grid item xs={12} sm={8}>
                <div className="row">
                  <div>
                    <div>
                      <h4>
                        <b>Forgot Password</b>
                      </h4>
                      <p className="grey-text text-darken-1">
                        Don't have an account?{" "}
                        <Link to="/request-access">Request Access</Link>
                      </p>
                    </div>
                    <form noValidate onSubmit={this.onSubmit}>
                      <CardContent style={this.state.alert.show ? {} : { display: "none" }}>
                        <Alert severity={this.state.alert.type} onClose={this.onAlertClose}>
                          {this.state.alert.message}
                        </Alert>
                      </CardContent>
                      <div className="input-field col s12">
                        <input
                          onChange={this.onChange}
                          value={this.state.organisation}
                          error={errors.organisation}
                          id="organisation"
                          type="text"
                          className={classnames("", {
                            invalid: errors.organisation,
                          })}
                        />
                        <label htmlFor="organisation">Organisation</label>
                        <span className="red-text">
                          {errors.email}
                          {errors.emailnotfound}
                        </span>
                      </div>
                      <div className="input-field col s12">
                        <input
                          onChange={this.onChange}
                          value={this.state.email}
                          error={errors.email}
                          id="email"
                          type="email"
                          className={classnames("", {
                            invalid: errors.email || errors.emailnotfound,
                          })}
                        />
                        <label htmlFor="email">Email</label>
                        <span className="red-text">
                          {errors.email}
                          {errors.emailnotfound}
                        </span>
                      </div>
                      <div className="col s12" style={{ paddingLeft: "11.250px" }}>
                        <button
                          style={{
                            width: "150px",
                            borderRadius: "3px",
                            letterSpacing: "1.5px",
                            marginTop: "1rem",
                          }}
                          type="submit"
                          className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                    <div className="col s12" style={{ paddingTop: "20px" }}>
                      <Link to="/login"> Login?</Link>
                    </div>
                  </div>
                </div>
              </Grid>
            </Grid>

          </div>
        </AlertMinimal>
    );
  }
}

ForgotPassword.propTypes = {
  forgotPassword: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

const mapSateToProps = (state) => ({
  errors: state.errors,
});

export default connect(mapSateToProps, { forgotPassword })(ForgotPassword);

//