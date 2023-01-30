

function ___$insertStyle(css) {
  if (!css) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  var style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);
  return css;
}

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

___$insertStyle(".counter {\n  --bg-color: #f3f3f3;\n  --base-color: #666;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100px;\n  width: 70px;\n  margin: 10% auto;\n  border: 3px solid var(--base-color);\n  border-radius: 5px;\n  color: var(--base-color);\n  background-color: var(--bg-color);\n  cursor: pointer;\n  overflow: hidden;\n}\n.counter:hover {\n  color: var(--bg-color);\n  background-color: var(--base-color);\n  border-color: var(--bg-color);\n}\n.counter__count {\n  font-size: 2rem;\n  font-family: \"Segoe UI\", sans-serif;\n  color: inherit;\n  animation: in 1s ease alternate forwards;\n  pointer-events: none;\n}\n\n@keyframes in {\n  0% {\n    transform: translateY(-200%);\n  }\n  50% {\n    color: inherit;\n    font-size: 2.2rem;\n    transform: translateY(0);\n    opacity: 1;\n  }\n  90% {\n    opacity: 0;\n    color: var(--blaze);\n  }\n  100% {\n    transform: translateY(200%);\n    font-size: 1.8rem;\n    opacity: 0;\n  }\n}");

var useState = React.useState, useEffect = React.useEffect;
var Counter = function (_a) {
    var count = _a.count, className = _a.className;
    return (React.createElement("div", { className: "counter " + className },
        React.createElement("p", { key: count, className: "counter__count " + (className ? className + '__count' : '') }, count)));
};
var App = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = useState(0), count = _c[0], setCount = _c[1];
    useEffect(function () {
        var interval = setInterval(function () {
            if (count > 99)
                return setCount(0);
            setCount(count + 1);
        }, 1000);
        return function () { return clearInterval(interval); };
    }, [count, setCount]);
    return React.createElement(Counter, { className: className, count: count });
};

exports.default = App;
//# sourceMappingURL=index.js.map
