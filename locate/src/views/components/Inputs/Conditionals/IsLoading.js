import React, { Component } from "react";

const loading = {
  margin: "1em",
  fontSize: "24px",
};

export default class IsLoading extends Component {
  render() {
    return (
      <div>
        <div style={loading}>Loading User Data...</div>
      </div>
    );
  }
}
