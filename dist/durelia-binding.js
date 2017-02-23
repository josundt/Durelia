define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.observeDecoratorKeyName = "__observeDecorated__";
    function computedFrom() {
        var dependentProps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            dependentProps[_i] = arguments[_i];
        }
        return function (viewmodel, key, descriptor) {
        };
    }
    exports.computedFrom = computedFrom;
    function observe(enabled) {
        if (enabled === void 0) { enabled = true; }
        return function (viewmodel) {
            viewmodel[exports.observeDecoratorKeyName] = enabled;
        };
    }
    exports.observe = observe;
});
//# sourceMappingURL=durelia-binding.js.map