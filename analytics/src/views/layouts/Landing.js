import React, { Component } from "react";
import { Link } from "react-router-dom";

const analytics_logo_style = {
  width: "50%",
  height: "30%",
  marginTop: "30%",
  marginLeft: "25%",
};
class Landing extends Component {
  async componentDidMount() {
    var anchorElem = document.createElement("link");
    anchorElem.setAttribute(
      "href",
      "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"
    );
    anchorElem.setAttribute("rel", "stylesheet");
    anchorElem.setAttribute("id", "logincdn");
    document.getElementsByTagName("head")[0].appendChild(anchorElem);
  }

  componentWillUnmount() {
    let el = document.getElementById("logincdn");
    el.remove();
  }
  render() {
    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        <div className="row">
          <div
            className="col s6"
            style={{
              backgroundColor: "#2979FF",
              height: "50vh",
              width: "55vh",
            }}
          >
            <img
              alt="airqo.net"
              style={analytics_logo_style}
              src="/images/logos/airqo_logo.png"
            />
          </div>
          <div
            className="col s6"
            style={{ backgroundColor: "#fff", height: "50vh", width: "75vh" }}
          >
            <div
              className="col s3"
              style={{
                marginTop: "30%",
                marginLeft: "15%",
              }}
            >
              <Link
                to="/register"
                style={{
                  width: "140px",
                  borderRadius: "3px",
                  letterSpacing: "1.5px",
                }}
                className="btn btn-large waves-effect waves-light hoverable blue accent-3"
              >
                Register
              </Link>
            </div>
            <div
              className="col s3"
              style={{
                marginTop: "30%",
                marginLeft: "5%",
              }}
            >
              <Link
                to="/login"
                style={{
                  width: "140px",
                  borderRadius: "3px",
                  letterSpacing: "1.5px",
                }}
                className="btn btn-large waves-effect waves-light hoverable blue accent-3"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Landing;

//
