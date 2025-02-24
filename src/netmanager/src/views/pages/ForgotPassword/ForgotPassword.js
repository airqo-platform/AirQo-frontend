/* eslint-disable */
import React, { Component } from "react";
import { useDispatch } from "react-redux";
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
import { updateMainAlert } from "redux/MainAlert/operations";
import TextField from "@material-ui/core/TextField";

const title = {
  pageTitle: "Forgot Password Screen",
};

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.tenant = this.props.match.params.tenant || "airqo";
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
      organisation: this.tenant,
    };

    await forgotPasswordResetApi(userData)
        .then(responseData => {
          this.props.updateMainAlert({
            show: true,
            message: "Operation successful. Please check your email for the password reset link.",
            severity: "success"
          })
          this.setState({
            email: "",
            organisation: "",
          })
        })
        .catch(err => {
          this.props.updateMainAlert({
            show: true,
            message: err.response && err.response.data && err.response.data.message,
            severity: "error"
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
                      <div style={{padding: "5px"}}>
                        <TextField
                        onChange={this.onChange}
                        value={this.state.email}
                        error={!!errors.email}
                        id="email"
                        type="email"
                        label="Email"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        helperText={errors.email}
                      />
                      </div>

                      <div className="col s12" style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center", }}
                      >
                        <button
                          style={{
                            borderRadius: "3px",
                            letterSpacing: "1.5px",
                            marginTop: "1rem",
                          }}
                          type="submit"
                          className="btn waves-effect waves-light hoverable blue accent-3"
                        >
                          email me a link
                        </button>
                      </div>
                    </form>
                    <div className="col s12" style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "5px",
                      }}
                    >
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

export default connect(mapSateToProps, { forgotPassword, updateMainAlert })(ForgotPassword);

//