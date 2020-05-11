import React from "react";

const loading = {
  margin: "1em",
  fontSize: "24px",
};

export default function IsLoading() {
  return (
    <div>
      <div style={loading}>Loading User Data...</div>
    </div>
  );
}
