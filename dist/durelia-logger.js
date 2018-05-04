var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "durandal/system", "durelia-dependency-injection"], function (require, exports, durandalSystem, durelia_dependency_injection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SeverityLevel;
    (function (SeverityLevel) {
        SeverityLevel[SeverityLevel["none"] = 0] = "none";
        SeverityLevel[SeverityLevel["debug"] = 1] = "debug";
        SeverityLevel[SeverityLevel["info"] = 2] = "info";
        SeverityLevel[SeverityLevel["warn"] = 3] = "warn";
        SeverityLevel[SeverityLevel["error"] = 4] = "error";
    })(SeverityLevel || (SeverityLevel = {}));
    var Logger = /** @class */ (function () {
        function Logger() {
        }
        Object.defineProperty(Logger.prototype, "severityThreshold", {
            /** @internal */
            get: function () {
                return durandalSystem.debug() ? SeverityLevel.debug : SeverityLevel.warn;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Internal log method
         * @internal
         * @private
         * @param {SeverityLevel} [severityLevel=SeverityLevel.debug] The severity level
         * @param {ILogger} appender Appender
         * @param {LogAppender} appenderFn Appender function
         * @param {string} message Message
         * @param {...any[]} properties Additional properties
         * @returns {void}
         * @memberOf Logger
         */
        Logger.prototype.log = function (severityLevel, appender, appenderFn, message) {
            if (severityLevel === void 0) { severityLevel = SeverityLevel.debug; }
            var properties = [];
            for (var _i = 4; _i < arguments.length; _i++) {
                properties[_i - 4] = arguments[_i];
            }
            if (severityLevel >= this.severityThreshold) {
                /* tslint:disable:no-console */
                appenderFn.call.apply(appenderFn, [appender, message].concat(properties));
                /* tslint:enable:no-console */
            }
        };
        Logger.prototype.debug = function (message) {
            var properties = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                properties[_i - 1] = arguments[_i];
            }
            this.log.apply(this, [SeverityLevel.debug, console, console.debug, message].concat(properties));
        };
        Logger.prototype.info = function (message) {
            var properties = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                properties[_i - 1] = arguments[_i];
            }
            this.log.apply(this, [SeverityLevel.info, console, console.info, message].concat(properties));
        };
        Logger.prototype.warn = function (message) {
            var properties = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                properties[_i - 1] = arguments[_i];
            }
            this.log.apply(this, [SeverityLevel.warn, console, console.warn, message].concat(properties));
        };
        Logger.prototype.error = function (message) {
            var properties = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                properties[_i - 1] = arguments[_i];
            }
            this.log.apply(this, [SeverityLevel.error, console, console.error, message].concat(properties));
        };
        Logger = __decorate([
            durelia_dependency_injection_1.singleton
        ], Logger);
        return Logger;
    }());
    exports.Logger = Logger;
});
//# sourceMappingURL=durelia-logger.js.map