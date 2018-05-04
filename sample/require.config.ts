interface IRequireJsPathConfig {
    [moduleName: string]: string;
}
interface IRequireJsShimConfigValue {
    exports?: string | string[];
    deps?: string | string[];
}
interface IRequireJsShimConfig {
    [moduleName: string]: string[] | IRequireJsShimConfigValue;
}
interface IRequireJsMapConfigValue {
    [internalModuleName: string]: string;
}
interface IRequireJsMapConfig {
    [moduleName: string]: IRequireJsMapConfigValue;
}
interface IRequireJsConfig {
    waitSeconds?: number;
    paths?: IRequireJsPathConfig;
    shim?: IRequireJsShimConfig;
    map?: IRequireJsMapConfig;
}

// PS!PS! It is important that this file is not included when bundling with requirejs optimizer
// The file is currently explicitly excluded by the Grunt Task that collects TypeScript sources

let require: IRequireJsConfig = {
    waitSeconds: 60,
    paths: {

        "durelia-binding":              "../../dist/durelia-binding",
        "durelia-dependency-injection": "../../dist/durelia-dependency-injection",
        "durelia-dialog":               "../../dist/durelia-dialog",
        "durelia-framework":            "../../dist/durelia-framework",
        "durelia-logger":               "../../dist/durelia-logger",
        "durelia-router":               "../../dist/durelia-router",
        "durelia-templating":           "../../dist/durelia-templating",

        "durandal": "../../node_modules/durandal/js",
        "plugins": "../../node_modules/durandal/js/plugins",
        "transitions": "../../node_modules/durandal/js/transitions",

        "bluebird": "../../node_modules/bluebird/js/browser/bluebird.core",
        "text": "../../node_modules/requirejs-text/text",
        "jquery": "../../node_modules/jquery/dist/jquery",
        "knockout": "../../node_modules/knockout/build/output/knockout-latest.debug",
        "tslib": "../../node_modules/tslib/tslib"
    },
    shim: {
        "bluebird": { exports: "Promise" },
        "jquery": { exports: "jQuery" },
        "knockout": { exports: "ko" }
    }
};