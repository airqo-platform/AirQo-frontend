import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import * as React from 'react';
import PropTypes from 'prop-types';
import { isFragment } from 'react-is';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
var SPACINGS = {
  small: -16,
  medium: null
};
export var styles = function styles(theme) {
  return {
    /* Styles applied to the root element. */
    root: {
      display: 'flex'
    },

    /* Styles applied to the avatar elements. */
    avatar: {
      border: "2px solid ".concat(theme.palette.background.default),
      marginLeft: -8
    }
  };
};
var AvatarGroup = React.forwardRef(function AvatarGroup(props, ref) {
  var childrenProp = props.children,
      classes = props.classes,
      className = props.className,
      _props$spacing = props.spacing,
      spacing = _props$spacing === void 0 ? 'medium' : _props$spacing,
      _props$max = props.max,
      max = _props$max === void 0 ? 5 : _props$max,
      other = _objectWithoutProperties(props, ["children", "classes", "className", "spacing", "max"]);

  var children = React.Children.toArray(childrenProp).filter(function (child) {
    if (process.env.NODE_ENV !== 'production') {
      if (isFragment(child)) {
        console.error(["Material-UI: the AvatarGroup component doesn't accept a Fragment as a child.", 'Consider providing an array instead.'].join('\n'));
      }
    }

    return React.isValidElement(child);
  });
  var extraAvatars = children.length > max ? children.length - max : 0;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: clsx(classes.root, className),
    ref: ref
  }, other), children.slice(0, children.length - extraAvatars).map(function (child, index) {
    return React.cloneElement(child, {
      className: clsx(child.props.className, classes.avatar),
      style: _extends({
        zIndex: children.length - index,
        marginLeft: spacing && SPACINGS[spacing] !== undefined ? SPACINGS[spacing] : -spacing
      }, child.props.style)
    });
  }), extraAvatars ? /*#__PURE__*/React.createElement(Avatar, {
    className: classes.avatar,
    style: {
      zIndex: 0,
      marginLeft: spacing && SPACINGS[spacing] !== undefined ? SPACINGS[spacing] : -spacing
    }
  }, "+", extraAvatars) : null);
});
process.env.NODE_ENV !== "production" ? AvatarGroup.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------

  /**
   * The avatars to stack.
   */
  children: PropTypes.node,

  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object,

  /**
   * @ignore
   */
  className: PropTypes.string,

  /**
   * Max avatars to show before +x.
   */
  max: PropTypes.number,

  /**
   * Spacing between avatars.
   */
  spacing: PropTypes.oneOfType([PropTypes.oneOf(['medium', 'small']), PropTypes.number])
} : void 0;
export default withStyles(styles, {
  name: 'MuiAvatarGroup'
})(AvatarGroup);