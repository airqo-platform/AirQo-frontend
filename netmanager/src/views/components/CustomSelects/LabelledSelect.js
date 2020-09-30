import React from "react";
import Select, { components } from "react-select";
import PropTypes from "prop-types";

const customSelectStyles = {
  menu: (provided, state) => ({
    ...provided,
    zIndex: 20,
  }),
};

const Label = ({ label, isFloating }) => {
  const top = isFloating ? `5px` : `35%`;
  const fontSize = isFloating ? `0.65rem` : `1rem`;

  const labelStyle = {
    left: "10px",
    top: top,
    pointerEvents: "none",
    position: "absolute",
    transition: "0.2s ease all",
    MozTransition: "0.2s ease all",
    WebkitTransition: "0.2s ease all",
    fontSize: fontSize,
    zIndex: 10,
  };
  return <label style={labelStyle}>{label}</label>;
};

Label.propTypes = {
  label: PropTypes.string.isRequired,
  isFloating: PropTypes.bool.isRequired,
};

const Control = (props) => {
  return (
    <div style={{ position: "relative" }}>
      <Label
        label={props.selectProps.label}
        isFloating={props.isFocused || props.hasValue}
      />
      <components.Control {...props} />
    </div>
  );
};

const LabelledSelect = ({ label, components, ...props }) => {
  return (
    <Select
      styles={customSelectStyles}
      label={label}
      components={{ ...components, Control }}
      {...props}
    />
  );
};

LabelledSelect.propTypes = {
  label: PropTypes.string.isRequired,
  components: PropTypes.object,
};

export default LabelledSelect;
