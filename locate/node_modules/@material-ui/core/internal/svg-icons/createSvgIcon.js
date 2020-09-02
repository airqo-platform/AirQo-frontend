"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createSvgIcon;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var React = _interopRequireWildcard(require("react"));

var _SvgIcon = _interopRequireDefault(require("../../SvgIcon"));

function createSvgIcon(path, displayName) {
  var Component = React.memo(React.forwardRef(function (props, ref) {
    return React.createElement(_SvgIcon.default, (0, _extends2.default)({}, props, {
      ref: ref
    }), path);
  }));

  if (process.env.NODE_ENV !== 'production') {
    Component.displayName = "".concat(displayName, "Icon");
  }

  Component.muiName = _SvgIcon.default.muiName;
  return Component;
}