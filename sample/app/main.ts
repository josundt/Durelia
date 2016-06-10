/* tslint:disable:class-name */

import * as Q from "q";
import * as Bluebird from "bluebird";

import * as app from "durandal/app";
import * as viewLocator from "durandal/viewLocator";
import * as binder from "durandal/binder";
import * as system from "durandal/system";
import {durelia} from "durelia-framework";


app.title = "Durelia sample";

//>>excludeStart("build", true);
system.debug(true);
binder.throwOnErrors = true;
//>>excludeEnd("build");

app.configurePlugins({
    router: true,
    dialog: true,
    observable: true
});

app.start().then((result) => {

    viewLocator.useConvention("views", "views");

    // BOOTSTRAPPING THE DURELIA EXTENSION //
    durelia.use
        .nativePromise(Q.Promise) // Using Q as ES2015 Promise override
        //.nativePromise(Bluebird) // Example on how to use BlueBird as promis polyfill
        .viewModelDefaultExports()
        .observeDecorator()
        .routerModelActivation();

    app.setRoot("views/shell", "entrance");
});
