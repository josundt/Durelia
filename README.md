# Durelia
## Durandal extension
### Enabling a step-by-step transition from Durandal towards Aurelia

**Durelia** extends the *Durandal* Single Page Application framework by replicating
a subset of the Aurelia features.
The features provided by Durelia mostly have identical signatures as their Aurelia peers.
The goal of Durelia is to simplify the migration of existing applications from Durandal
to Aurelia, and to enable a step by step refactoring path that can be perforrmed gradually
over time without breaking existing application functionality.

## Durelia helps you with the following:

### 1. ES2015 Promises instead of jQuery Deferred/Promise


Durandal uses the jQuery Deferred/Promise implementation for async operations.
This Promise implementation deviates from the ES2015 Promise specification.
Durelia is able to alter Durandals behavior to make it use the native ES2015
Promise instead (which is enabled in all current browsers and can also be polyfilled).

*Example (when targeting only modern modern browers, or when already having a polyfill installed):*
```javascript
import {durelia} from "durelia-framework";

durelia.use
    .navivePromise();
```

*Example (when you want to install **Q** as ES2015 Promise a polyfill as you enable ES2015 Promise for Durandal):*
```javascript
import {durelia} from "durelia-framework";
import * as Q from "q";

durelia.use
    .nativePromise(Q.Promise);
```

*Example (when you want to install **Bluebird** as ES2015 Promise even in browsers with native Promise support):*
```javascript
import {durelia} from "durelia-framework";
import * as Bluebird from "bluebird";

Bluebird.config({ 
    warnings: { wForgottenReturn: false } 
});

durelia.use
    .nativePromise(Bluebird, true); // true: use even in browsers with Promise support
```
*Durandal will cause Bluebird to show some unwanted warnings in the console, you 
should therefore configure Bluebird as described above.*

If you are using TypeScript typings e.g. from definitelyTyped for intellisense
support, you may want to include a es6-promise typings file, and change the
Promise definition in the Durandal typings file.
Change one of the first lines in the Durandal .d.ts file as follows.
```typescript
// Before:
//interface DurandalPromise<T> extends JQueryPromise<T> { }
// After:
interface DurandalPromise<T> extends Promise<T> { }
```

### 2. Dependency injection
Durelia provides a Dependecy Injection (DI)/Inversion of Control (IoC) Container
and offers ESNEXT decorators to support DI with the exact same signatures as the
ones in Aurelia. The Durelia IoC container implementation is a bit simpler than
the one in Aurelia; there is only one container (no child containers) and for this
reason, injections are resolved as transient (as opposed to singleons) by default.
In practical usage it will still work pretty much the same way. 

```javascript
import {inject, transient, singleton, Lazy} from "durelia-framework";

@transient
@inject(MyService)
export default class MyPage {
    constructor(myService) {
        this.myService = myService;
    }
}

@singleton
@inject(Lazy.of(localStorage))
export class MyService {
    constructor(getStorage) {
        this.storage = getStorage();
    }
}

```

In addition to the static injection decorators support, the dynamic instance registration
API from Aurelia is also supported:

```javascript
import {Durelia, inject} from "durelia-framework";

@inject(Durelia)
class A {
    constructor(durelia) {
        durelia.use.instance(B, new B());
    }
}

class B {
}

@inject(B)
class C {
    constuctor(b) {
        // The instance registered in A's constructor will be injected here
        // It requires that the registration happens before C is attempted resolved.
    }
}
```

For more info, check how this works in Aurelia; it works the exact same way here ;-)

### 3. Enabling the Durandal Router to look for the *default export* class/object
Durandal dependes on a 3rd party module loader like RequireJS.
Most Durandal applications use RequireJS as a module loader.
The RequireJS AMD module loader implementation had some limitations and devations
from the new ES2015 module import/export specification, but when Durandal was
released this was not yet available.
ES2015 allows you to export multiple classes/variables/functions from a module.
ES2015 also allows you to have a single ***default export*** class/variable/function in a module.

Durelia can alter/extend the behavior of the Durandal router, making it look for and
prioritize any existing default export of a module when determining what to use as ViewModel
for the View/ViewModel pair after the module has been loaded.
```javascript
import {durelia} from "durelia-framework";

durelia.use
    .viewModelDefaultExports();
```


```javascript
export default class MyPage { // Notice the "default" keyword; this class will be used as ViewModel
}
```

#### Limitations
When using classes as ViewModels, Durandal has no way to figure out from where it
should load the HTML View for the ViewModel.
Durelia provides a decorator (with the exact same signature as the one in Aurelia).
When using this, the ViewModel instructs Durandal where to load the HTML View from.

```javascript
import {useView} from "durelia-framework";

@useView("views/mypage.html")
export default class MyPage {
    [...]
}
```
***Editors remark**: I know you MVVM purists out there are not to happy with this; but concider
this a temporary necessary evil. If you still follow the conventional view/viewmodel naming
convention these attributes can be removed once migration to Aurelia is complete.*

### 4. Disconnecting from KnockoutJS: Enabling the Durandal Observable plugin on a per-viewmodel basis
KnockoutJS is the Durandal dependency causing the biggest footprints in Durandal applications.

Durandal provides a plugin called "observable" that leverages automatic creation of
property getters/setters wrapping the observables for all members of a viewmodel.
This plugin performs this conversion just before the databinding occurs.
The observable plugin also uses KnockoutJS under the hood, but it can help you eliminate
the significant Knockout footprints (all those parenthesises!!). And refactor one page
at the time in your application using the @observalbe decorator to enable the plugin
on a per-viewmodel basis. This will bring your code many steps closer to Aurelia.

Durelia also allows you to create computed properties using the *computedFrom* decorator
(exact same signature as in Aurelia).

In the bootstrapper of the application:
```javascript
durelia.use
    .observeDecorator();
```

In a ViewModel class:
```javascript
import {observe, computedFrom} from "durelia-framework";

// Enable the observe plugin
// for this viewmodel to convert
// members before databinding:
@observe
export default class MyPage {

    // Will be converted to
    // a property getter/setter
    // wrapping a knockout observable:
    member = null;

    // Will be converted to
    // a property getter wrapping
    // a knockout computed:
    @computedFrom("member")
    get compuded() {
        return `Member value is: ${member}`;
    }
}

```

### 5. Aurelia DialogService and DialogController replicated
The dialog plugin for Durandal and the one for Aurelia are quite similar, but
there are a few differences. Durelia's "durelia-dialog" module contain two wrapper classes
that eliminate the differences by replicating the Aurelia signatures.

*Using the DialogService to open a dialog window:*
```javascript
import {inject} from "durelia-framework";
import {DialogService} from "durelia-dialog";
import {MyDialogViewModel} from "views/my-dialog-viewmodel";

@inject(DialogService)
export default class MyPage {
    constructor(dialog) {
        this.dialog = dialog;
    }

    openDialog() {
        let dialogActivationOptions = {
            title: "Dialog title",
            text: "Dialog body"
        });

        this.dialog.open({
            viewModel: MyDialogViewModel,
            model: dialogActivationOptions
        }).then(result => {

        });
    }
}
```

*Using the DialogController to close from within a dialog viewmodel returning the async result:*
```javascript
import {inject} from "durelia-framework";
import {DialogController} from "durelia-dialog";

@inject(DialogController)
export class MyDialogViewModel {
    constructor(controller) {
        this.controller = controller;
    }

    ok() {
        this.controller.ok({ agreed: true }, this);
    }

    cancel() {
        this.controller.cancel({ agreed: false }, this);
    }
}

```
*PS! Notice that the ok and cancel methods of DialogController is calld with "this" as the
seconde argument. This is exactly the same as in Aurelia, but was needed to make it work
with Durandal.*

### 6. Aligning router viewmodel activation and navigation with Aurelia
The router in Aurelia is a somewhat different from the Durandal implementation on:
* How it passes parsed route arguments from the browser URL to the activate method of the activating viewmodel.
* How you can use the router to generate navigation urls.

Durelia to the rescue!

By enabling this feature you will alter the Durandal behavior and make the behavior identical
to Aurelia (with respect to the two differences stated above):
```javascript
durelia.use
    .routerModelActivation();
```
Example:

*Setting up a Durandal route (ensure you give the route a **name** property):*
```javascript
    router.map([{
        name: "NoteDetail",
        route: "notes/:id", // Notice the :id route parameter
        title: "Note detail",
        moduleId: "views/notes/notedetail",
        nav: false
    }]).buildNavigationModel();
```

*Durelia provides a NavigationController to help you construct urls from a route to navigate:*
```javascript
import {NavigationController} from "durelia-router";
@inject(NavigationController)
export default class MyPage {
    constructor(navigator) {
        this.navigator = navigator;
    }

    goToNote(id) {
        // Creating an activationArgs object
        let activationArgs = {
            id: 5,
            someExtraProp: "hello"
        };

        this.navigator.navigateToRoute(
            "NoteDetail", // route name - see above
            activationArgs);
    }
}

[...]
```

Alternatively, you can perform navigation directly from the view using Durelia's "route-href" 
knockout binding handler, which emulates the Aurelia route-href custom attribute:
```html
<a data-bind="route-href: { route: 'NoteDetail',  params: { id: 5, someExtraProp: 'hello' }}">Go to note detail</a>
```

Both examples above will trigger a browser navigate to the following url

[...]**notes/5?someExtraProp=hello**

***Explained:***
The ***"id"*** property of ***activationArgs*** is merged with the ***"id"*** parameter of the
***route configuration***.
Since The ***"someExtraProp"*** property of ***activationArgs*** will
not find a route parameter matching the property name, it cannot be merged into the route;
-the "fallback strategy" behavior is to pass the property name and value as
***queryString*** args instead.

*The **activate** method of the activating viewmodel will then be called:*
```javascript
export class NoteDetails {
    activate(activationModel) {
        [...]
    }
}
```
*...and the **activationModel** will be an object containing
the merged **route** and **queryString** arguments:*
```javascript
{
    id: 5,
    someExtraProp: "hello"
}
```

While the Durandal behavior is to relay each route argument as separate
string arguments when invoking the viewmodel activate method; Durelia (and Aurelia)
invokes it with a single object instead (if enabled).
You may have noticed that the object sent as argument consists of the exact same properties
and values as was sent in the ***navigateToRoute*** call earlier (see example above).

### Great intellisense and TypeScript interfaces
Durelia is implemented in typescript, and TypeScript typings are generated when building.
These are included along with the JavaScript files. This provides great intellisense
both for Durandal JavaScript or TypeScript projects if you use an editor that supports it.

Most of the classes in Durelia has an interface "twin". If you use Durelia with a TypeScript
application and write unit tests using TypeScript, it will simplify mocking the dependencies
if you use the interface types for the constructor function parameters and inject the
implementations through the inject decorator.

Some functions and classes have generic type arguments, that helps you create even more type-safe
code.

## Sample Application
The repository contains a sample application that covers the most common Durandal
usage and how to do it with Durelia. The sample application is written using
TypeScript. Please disregard the bad UI design and lack of creativity in
feature set; the interesting part is the TypeScript code and the typical usage
scenarios it demonstrates.

To run the sample application; clone the repository and run following from the console:
```bash
npm install
npm start
```

## Getting started

### Prerequisites
**a)** You have already; or you are ready to change your javascript/typescript
code base into ES2015 class style implementations.

**b)** You have installed the Durelia javascript (and typings) f.ex. using bower:

```bash
bower install durelia --save

```

**c)** You have a ES2015 promise package installed (f.ex. Bluebird or Q).

**d)** You have configured paths of your module loader:

Example (RequireJS):
```javascript
let require = {
    paths: {
        "durelia-binding":              "bower_components/dist/durelia-binding",
        "durelia-dependency-injection": "bower_components/dist/durelia-dependency-injection",
        "durelia-dialog":               "bower_components/dist/durelia-dialog",
        "durelia-framework":            "bower_components/dist/durelia-framework",
        "durelia-logger":               "bower_components/dist/durelia-logger",
        "durelia-router":               "bower_components/dist/durelia-router",
        "durelia-templating":           "bower_components/dist/durelia-templating",

        "durandal": "bower_components/durandal/js",
        "plugins": "bower_components/durandal/js/plugins",

        "bluebird": "bower_components/bluebird/js/browser/bluebird"
    }
};
```
**e)** You have called the durelia.use.x enabler functions for the the desired features.
NB! This needs to happen after app.start() has finished asynchronously:

```javascript
app.start().then((result) => {

    durelia.use
        .nativePromise()           // optional feature
        .viewModelDefaultExports() // optional feature
        .observeDecorator()        // optional feature
        .routerModelActivation();  // optional feature

    app.setRoot("views/shell", "entrance");
});
```

Remember that you can switch on each of these features separately, and perform a step-by-step
refactoring process. But once you're done and utilize all the features of Durelia, the
JavaScript or TypeScript code of your application should already be really close to Aurelia
compliant code.

You should be mostly left with one change:
Changing the one letter in the durelia related import statements that differs from aurelia.
Change the initial "d" with an "a"!

:-)
