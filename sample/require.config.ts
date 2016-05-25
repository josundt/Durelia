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
    waitSeconds: 5,
    paths: {
        "adra-jsutils-array":  "../bower_components/adra-jsutils/dist/amd/adra-jsutils-array",
        "adra-jsutils-cookie": "../bower_components/adra-jsutils/dist/amd/adra-jsutils-cookie",
        "adra-jsutils-date":   "../bower_components/adra-jsutils/dist/amd/adra-jsutils-date",
        "adra-jsutils-json":   "../bower_components/adra-jsutils/dist/amd/adra-jsutils-json",
        "adra-jsutils-obj":    "../bower_components/adra-jsutils/dist/amd/adra-jsutils-obj",
        "adra-jsutils-str":    "../bower_components/adra-jsutils/dist/amd/adra-jsutils-str",
        "adra-jsutils-calc":   "../bower_components/adra-jsutils/dist/amd/adra-jsutils-calc",
        "durelia-binding":              "../../dist/durelia-binding",
        "durelia-bootstrapper":         "../../dist/durelia-bootstrapper",
        "durelia-dependency-injection": "../../dist/durelia-dependency-injection",
        "durelia-dialog":               "../../dist/durelia-dialog",
        "durelia-framework":            "../../dist/durelia-framework",
        "durelia-logger":               "../../dist/durelia-logger",
        "durelia-templating":           "../../dist/durelia-templating",
        "bluebird": "../bower_components/bluebird/js/browser/bluebird",
        "text": "../bower_components/requirejs-text/text",
        "durandal": "../bower_components/durandal/js",
        "plugins": "../bower_components/durandal/js/plugins",
        "transitions": "../bower_components/durandal/js/transitions",
        "jquery": "../bower_components/jquery/dist/jquery",
        "knockout": "../bower_components/knockout/dist/knockout.debug",
        "q": "../bower_components/q/q"
    },
    shim: {
        "bluebird": { exports: "Promise" },
        "jquery": { exports: "jQuery" },
        "knockout": { exports: "ko" },
        "q": { exports: "Q" }
    }
};