import React from "react";
import Select from "react-select";
import PropTypes from "prop-types";

const ReactSelect = ({
  clearable,
  disabled,
  loading,
  rtl,
  searchable,
  multiInputs,
  options,
  defaultValue,
}) => {
  return (
    <Select
      className={multiInputs ? "basic-multi-select" : "basic-single"}
      classNamePrefix="select"
      defaultValue={defaultValue}
      isDisabled={!!disabled}
      isLoading={!!loading}
      isClearable={!!clearable || true}
      isRtl={!!rtl}
      isSearchable={!!searchable || true}
      isMulti={!!multiInputs}
      name="color"
      options={options}
    />
  );
};

ReactSelect.propTypes = {
  clearable: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  rtl: PropTypes.bool,
  searchable: PropTypes.bool,
  multiInputs: PropTypes.bool,
  options: PropTypes.array,
  defaultValue: PropTypes.object,
};

export default ReactSelect;
