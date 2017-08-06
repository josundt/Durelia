define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function useView(viewPath) {
        return function (classType) {
            classType.prototype.getView = function () { return viewPath; };
        };
    }
    exports.useView = useView;
});
//# sourceMappingURL=durelia-templating.js.map