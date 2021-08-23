import React from "react";
import Select, { components } from "react-select";

const { ValueContainer, Placeholder } = components;

const CustomValueContainer = ({ children, ...props }) => {
  return (
    <ValueContainer {...props}>
      <Placeholder {...props} isFocused={props.isFocused}>
        <span
          style={{
            position: "relative",
            backgroundColor: "white",
            opacity: 1,
            padding: "0 5px",
          }}
        >
          {props.selectProps.placeholder}
        </span>
      </Placeholder>
      {React.Children.map(children, (child) =>
        child && child.type !== Placeholder ? child : null
      )}
    </ValueContainer>
  );
};

export default function OutlinedSelect({ label, components, ...props }) {
  const scrollStyle = (props.scrollable && {
    height: props.height || "50px",
    overflow: "scroll",
  }) || { height: props.height || "50px", overflow: "visible" };
  const modifiedLabel =
    (props.required && <span>{label.trimEnd()} &#42;</span>) || label;
  return (
    <Select
      components={{
        ...components,
        ValueContainer: CustomValueContainer,
      }}
      {...{ ...props, placeholder: modifiedLabel }}
      styles={{
        container: (provided, state) => ({
          ...provided,
          // marginTop: 20,
        }),
        valueContainer: (provided, state) => ({
          ...provided,
          ...scrollStyle,
        }),
        placeholder: (provided, state) => ({
          ...provided,
          position: "absolute",
          top: state.hasValue || state.selectProps.inputValue ? -4 : "50%",
          transition: "top 0.1s, font-size 0.1s",
          color:
            state.hasValue || state.selectProps.inputValue
              ? "black"
              : "inherit",
          lineHeight: 1,
          letterSpacing: "-0.05px",
          fontSize: (state.hasValue || state.selectProps.inputValue) && 11,
        }),
      }}
    />
  );
}
