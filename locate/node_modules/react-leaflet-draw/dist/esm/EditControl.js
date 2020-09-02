function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { PropTypes } from 'prop-types';
import Draw from 'leaflet-draw'; // eslint-disable-line

import isEqual from 'lodash-es/isEqual';
import { MapControl, withLeaflet } from 'react-leaflet';
import leaflet, { Map, Control } from 'leaflet';
var eventHandlers = {
  onEdited: 'draw:edited',
  onDrawStart: 'draw:drawstart',
  onDrawStop: 'draw:drawstop',
  onDrawVertex: 'draw:drawvertex',
  onEditStart: 'draw:editstart',
  onEditMove: 'draw:editmove',
  onEditResize: 'draw:editresize',
  onEditVertex: 'draw:editvertex',
  onEditStop: 'draw:editstop',
  onDeleted: 'draw:deleted',
  onDeleteStart: 'draw:deletestart',
  onDeleteStop: 'draw:deletestop'
};

var EditControl =
/*#__PURE__*/
function (_MapControl) {
  _inherits(EditControl, _MapControl);

  function EditControl() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, EditControl);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(EditControl)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "onDrawCreate", function (e) {
      var onCreated = _this.props.onCreated;
      var layerContainer = _this.props.leaflet.layerContainer;
      layerContainer.addLayer(e.layer);
      onCreated && onCreated(e);
    });

    return _this;
  }

  _createClass(EditControl, [{
    key: "createLeafletElement",
    value: function createLeafletElement(props) {
      return createDrawElement(props);
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      _get(_getPrototypeOf(EditControl.prototype), "componentDidMount", this).call(this);

      var map = this.props.leaflet.map;
      var onMounted = this.props.onMounted;

      for (var key in eventHandlers) {
        if (this.props[key]) {
          map.on(eventHandlers[key], this.props[key]);
        }
      }

      map.on(leaflet.Draw.Event.CREATED, this.onDrawCreate);
      onMounted && onMounted(this.leafletElement);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      _get(_getPrototypeOf(EditControl.prototype), "componentWillUnmount", this).call(this);

      var map = this.props.leaflet.map;
      map.off(leaflet.Draw.Event.CREATED, this.onDrawCreate);

      for (var key in eventHandlers) {
        if (this.props[key]) {
          map.off(eventHandlers[key], this.props[key]);
        }
      }
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      // super updates positions if thats all that changed so call this first
      _get(_getPrototypeOf(EditControl.prototype), "componentDidUpdate", this).call(this, prevProps);

      if (isEqual(this.props.draw, prevProps.draw) || this.props.position !== prevProps.position) {
        return false;
      }

      var map = this.props.leaflet.map;
      this.leafletElement.remove(map);
      this.leafletElement = createDrawElement(this.props);
      this.leafletElement.addTo(map);
      return null;
    }
  }]);

  return EditControl;
}(MapControl);

_defineProperty(EditControl, "propTypes", _objectSpread({}, Object.keys(eventHandlers).reduce(function (acc, val) {
  acc[val] = PropTypes.func;
  return acc;
}, {}), {
  onCreated: PropTypes.func,
  onMounted: PropTypes.func,
  draw: PropTypes.shape({
    polyline: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    polygon: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    rectangle: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    circle: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    marker: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
  }),
  edit: PropTypes.shape({
    edit: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    remove: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    poly: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    allowIntersection: PropTypes.bool
  }),
  position: PropTypes.oneOf(['topright', 'topleft', 'bottomright', 'bottomleft']),
  leaflet: PropTypes.shape({
    map: PropTypes.instanceOf(Map),
    layerContainer: PropTypes.shape({
      addLayer: PropTypes.func.isRequired,
      removeLayer: PropTypes.func.isRequired
    })
  })
}));

function createDrawElement(props) {
  var layerContainer = props.leaflet.layerContainer;
  var draw = props.draw,
      edit = props.edit,
      position = props.position;
  var options = {
    edit: _objectSpread({}, edit, {
      featureGroup: layerContainer
    })
  };

  if (draw) {
    options.draw = _objectSpread({}, draw);
  }

  if (position) {
    options.position = position;
  }

  return new Control.Draw(options);
}

export default withLeaflet(EditControl);