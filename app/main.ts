/* tslint:disable:class-name */

import * as Q from "q";
//import * as bluebirdPromise from "bluebird";

import * as durandalApp from "durandal/app";
import * as durandalViewLocator from "durandal/viewLocator";
import * as durandalBinder from "durandal/binder";
import * as durandalSystem from "durandal/system";
import {container, IDependencyInjectionContainer} from "framework/dependency-injection";

// Setting bluebird Promise as global window.Promise polyfill

window["Promise"] = Q.Promise; //bluebirdPromise; 

declare let requirejs: any;
enum PromiseImplementation { Q, Bluebird }

class durandalConfig {
    static configure(system: DurandalSystemModule, app: DurandalAppModule) {
        this.configurePromise(PromiseImplementation.Q, system);
        this.configureRuntime(system);
        this.enableViewModelDefaultExports(system);
        this.configurePlugins(app);
    }

    private static container: IDependencyInjectionContainer = container;

    private static configurePromise(implementation: PromiseImplementation, system: DurandalSystemModule) {

        // Overriding durandal to use Q library's deferred/promise implementation instead of jQuery's
        // This is done according to DurandalJS recommandations/specifications.
        // Reference: http://durandaljs.com/documentation/Q/

        if (implementation === PromiseImplementation.Bluebird) {
            // Since Durandal is using fail() instead of ES6 standard catch(), need to make a copy of the catch function.
            Promise["prototype"]["fail"] = Promise["prototype"]["catch"];

        }

        function useQ() {
            system.defer = function (action?: Function) {
                return <any>Q.defer();
            };
        }

        function nativePromiseDefer<T>(): Deferred<T> {
            let result = <Deferred<T>>{};
            result.promise = new Promise(function (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) {
                result.resolve = <any>resolve;
                result.reject = <any>reject;
            });
            return result;

        }

        system.defer = function (action?: Function) {
            let deferred = implementation === PromiseImplementation.Q
                ? <any>Q.defer()
                : <any>nativePromiseDefer();

            if (action) { action.call(deferred, deferred); }
            let prom = deferred.promise;
            deferred["promise"] = () => prom;
            return deferred;
        };
    }

    private static configureRuntime(system: DurandalSystemModule) {

        durandalApp.title = "Durandal Extensibility PoC";

        //>>excludeStart("build", true);
        // PS! The code between excludeStart and excludeEnd is not included after optimizing
        // Enable degug in non-optimized mode
        durandalSystem.debug(true);
        // Throw on databinding errors in non-optimized mode
        durandalBinder.throwOnErrors = true;
        //>>excludeEnd("build");
    }

    private static configurePlugins(app: DurandalAppModule) {
        //specify which plugins to install and their configuration
        durandalApp.configurePlugins({
            router: true,
            //dialog: true,
            observable: true,
            widget: {
                kinds: ["expander"]
            }
        });
    }
    
    private static enableViewModelDefaultExports(system: DurandalSystemModule) {
        system["resolveObject"] = (module) => {
            if (module && module.default && system.isFunction(module.default)) {
                let vm = this.container.resolve(module.default);
                return vm;
            } else if (system.isFunction(module)) {
                return this.container.resolve(module.default);
            } else {
                return module;
            }
        };
        
    }

    static init(app: DurandalAppModule, viewLocator: DurandalViewLocatorModule) {
        // When finding a viewmodel module, replace the viewmodel string 
        // with view to find it partner view.
        //router.makeRelative({ moduleId: "viewmodels" });
        durandalViewLocator.useConvention("views", "views");

        // Adapt to touch devices
        //app.adaptToDevice();

        //Show the app by setting the root view model for our application.
        durandalApp.setRoot("views/shell", "entrance");
    }
}

class requireConfig {
    static configure() {
        requirejs.config({
            map: {
                "breeze": {
                    "ko": "knockout",
                    "Q": "q"
                },
                "ko-k": {
                    "kendo": "k/kendo.core"
                },
                "kbkds": {
                    "kendo": "k/kendo.core"
                }
            }
        });

        //define("ko", ["knockout"], function (ko: KnockoutStatic) { return ko; });
    }
}

// class knockoutConfig {
//     static load(system: DurandalSystemModule): Promise<any> {
//         return system.acquire("core/bindinghandlers");
//     }
// }
/* tslint:enable:class-name */

//requireConfig.configure();

durandalConfig.configure(durandalSystem, durandalApp);

durandalApp.start().then((result) => {
    durandalConfig.init(durandalApp, durandalViewLocator);
});

/* tslint:enable:class-name */
