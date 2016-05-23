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
        "bluebird": "../bower_components/bluebird/js/browser/bluebird",
        "text": "../bower_components/requirejs-text/text",
        "durandal": "../bower_components/durandal/js",
        "plugins": "../bower_components/durandal/js/plugins",
        "transitions": "../bower_components/durandal/js/transitions",
        "jquery": "../bower_components/jquery/dist/jquery",
        "knockout": "../bower_components/knockout/dist/knockout.debug",
        "knockout.mapping": "../bower_components/knockout-mapping/build/output/knockout.mapping-latest",
        "q": "../bower_components/q/q"
    },
    shim: {
        "bluebird": { exports: "Promise" },
        "jquery": { exports: "jQuery" },
        "knockout": { exports: "ko" },
        "knockout.mapping": ["knockout"],
        "q": { exports: "Q" }
    }
};