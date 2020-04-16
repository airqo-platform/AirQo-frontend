import React, { Component } from "react";

export default class Updated extends Component {
  render() {
    return (
      <div>
        <form className="password-form" onSubmit={this.onSubmit}>
          <div className="input-field col s12">
            <input
              onChange={this.onChange}
              value={this.state.password}
              error={errors.password}
              id="password"
              type="password"
            />
            <label htmlFor="password">Password</label>
            <span className="red-text">{errors.password}</span>
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
              Update Password
            </button>
          </div>
        </form>

        {updated && (
          <div>
            <Link to="/" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Back to
              home
            </Link>
            <p>
              Your password has been successfully reset, please try logging in
              again.
            </p>
            <p className="grey-text text-darken-1">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        )}
      </div>
    );
  }
}
