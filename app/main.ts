/* tslint:disable:class-name */

import * as Q from "q";
//import * as bluebirdPromise from "bluebird";

import * as app from "durandal/app";
import * as viewLocator from "durandal/viewLocator";
import * as binder from "durandal/binder";
import * as system from "durandal/system";
import {dureliaBootstrapper} from "durelia-bootstrapper";


app.title = "Durandal Extensibility PoC";

//>>excludeStart("build", true);
system.debug(true);
binder.throwOnErrors = true;
//>>excludeEnd("build");

app.configurePlugins({
    router: true,
    //dialog: true,
    observable: true,
    widget: {
        kinds: ["expander"]
    }
});

app.start().then((result) => {
    
    viewLocator.useConvention("views", "views");

    // BOOTSTRAPPING THE DURELIA EXTENSION //
    dureliaBootstrapper
        .useES20015Promise(Q.Promise)
        .useViewModelDefaultExports()
        .useObserveDecorator();

    
    app.setRoot("views/shell", "entrance");
});
