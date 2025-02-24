import React from "react";
import PropTypes from "prop-types";

// css
import "assets/css/switch.css";

const Switch = ({ checked, onChange }) => {
  return (
    <div className="toggles">
      <input
        type="checkbox"
        name="styled"
        id="styled"
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor="styled" />
    </div>
  );
};

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};

export default Switch;
