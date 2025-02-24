import React from "react";
import Select, { components } from "react-select";
import CreatableSelect from "react-select/creatable";
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
    top: top,
    fontSize: fontSize,
  };
  return (
    <label className={"react-select-label"} style={labelStyle}>
      {label}
    </label>
  );
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
      {...{ ...props, placeholder: "" }}
    />
  );
};

export const CreatableLabelledSelect = ({ label, components, ...props }) => {
  return (
    <CreatableSelect
      styles={customSelectStyles}
      label={label}
      components={{ ...components, Control }}
      {...{ ...props, placeholder: "" }}
    />
  );
};

CreatableLabelledSelect.propTypes = {
  label: PropTypes.string.isRequired,
  components: PropTypes.object,
};

LabelledSelect.propTypes = {
  label: PropTypes.string.isRequired,
  components: PropTypes.object,
};

export default LabelledSelect;
