"use strict";

require("core-js/modules/es.weak-map.js");
require("core-js/modules/web.dom-collections.iterator.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _react2 = _interopRequireWildcard(require("@fullcalendar/react"));
var _daygrid = _interopRequireDefault(require("@fullcalendar/daygrid"));
var _interaction = _interopRequireDefault(require("@fullcalendar/interaction"));
var _timegrid = _interopRequireDefault(require("@fullcalendar/timegrid"));
var _list = _interopRequireDefault(require("@fullcalendar/list"));
var _BadgeModule = _interopRequireDefault(require("./Badge.module.css"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Badge = props => {
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h4", {
    className: _BadgeModule.default.red
  }, "Here is some text"), /*#__PURE__*/_react.default.createElement(_react2.default, {
    plugins: [_daygrid.default, _timegrid.default, _list.default, _interaction.default],
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay"
    },
    initialView: "dayGridMonth",
    events: [],
    selectable: true,
    selectMirror: true,
    height: "100vh"
  }));
};
var _default = Badge;
exports.default = _default;