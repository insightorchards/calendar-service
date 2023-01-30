"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _react2 = _interopRequireDefault(require("@fullcalendar/react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Badge = props => {
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "badge ".concat(!props.value ? "badge--none" : "", " ")
  }, /*#__PURE__*/_react.default.createElement("h4", null, props.value || 0), /*#__PURE__*/_react.default.createElement(_react2.default, {
    plugins: [],
    headerToolbar: {
      left: "prev,next today",
      center: "title"
    },
    events: [],
    selectable: true,
    selectMirror: true,
    height: "100vh"
  }));
};
var _default = Badge;
exports.default = _default;