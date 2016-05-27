#Durelia
##Durandal extension
###-enabling a step-by-step transition from Durandal towards Aurelia

**Durelia** extends the *Durandal* Single Page Application framework by replicating 
a subset of the Aurelia features.
The features provided by Durelia mostly have identical signatures as their Aurelia peers.
The goal of Durelia is to simplify the migration of existing applications from Durandal
to Aurelia, and to enable a step by step refactoring that can be perforrmed gradually 
over time without breaking existing application functionality.

##Durelia helps you with the following:

###1. ES2015 Promises instead of jQuery Deferred/Promise
Durandal uses the jQuery Deferred/Promise implementation for async operations.
That implementation deviates from the Promise specification from the ES2015 standard.
Durelia is able to alter Durandals behavior so that it uses the native ES2015 
Promise instead which is enabled in modern browsers and can be polyfilled.

*Example (when targeting only modern modern browers, or have a polyfill already installed:*
```javascript
import {dureliaBootstrapper} from "durelia-bootstrapper";

dureliaBootstrapper
    .useES20015Promise();
```

*Example (when you want to install **Q** as ES2015 Promise a polyfill as you enable ES2015 Promise for Durandal):*
```javascript
import {dureliaBootstrapper} from "durelia-bootstrapper";
import * as Bluebird from "bluebird";

dureliaBootstrapper
    .useES20015Promise(Q.Promise);
```  

*Example (when you want to install **Bluebird** as ES2015 Promise a polyfill as you enable ES2015 Promise for Durandal):*
```javascript
import {dureliaBootstrapper} from "durelia-bootstrapper";
import * as Bluebird from "bluebird";

dureliaBootstrapper
    .useES20015Promise(Bluebird);
```  

If you are using the TypeScript typings e.g. from definitelyTyped, you
may want to include a es6-promise typings file, and change the Promise
definition in the Durandal typings file.
Change one of the first lines in the Durandal .d.ts file as follows.
```typescript
// Change:
interface DurandalPromise<T> extends JQueryPromise<T> { }
// to:
interface DurandalPromise<T> extends Promise<T> { }
```

###2. Dependency injection
Durelia provides a Dependecy Injection Container and ESNEXT decorators support 
with the exact same signatures as the ones in Aurelia.
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
For more info, check how this works in Aurelia; it works the exact same way here ;-)

###3. Enabling the Durandal Router to look for the *default export* class/object 
When Durandal was released, it was dependent on a 3rd party module loader like RequireJS.
Most Durandal applications are using RequireJS as a module loader.
The RequireJS AMD module loader implementation had some limitations and devations
from the new ES2015 module import/export specification.
ES2015 allows you to export multiple classes/variables/functions from a module.
ES2015 also allows you to have a single ***default export*** class/variable/function in a module.

Durelia can alter/extend the behavior of the Durandal router, making it look for and 
prioritize any existing default export of a module when determining what to use as ViewModel
for the ViewModel/Model pair after the module has been loaded.
```javascript
import {dureliaBootstrapper} from "durelia-bootstrapper";

dureliaBootstrapper
    .useViewModelDefaultExports();
```  


```javascript
export default class MyPage { // Notice the "default" keyword; this class will be used as ViewModel
}
```

###4. Disconnecting from KnockoutJS: Enabling the Durandal Observable plugin on a per-viewmodel basis
The Durandal depndency causing the most significant footprint of any Durandal application; 
clearly distinguishing it from an Aurelia codebase, is KnockoutJS.

Durandal provides a plugin called "observable" that leverages automatic creation of 
property getters/setters wrapping the observables for all members of a viewmodel.
This conversion happens just before the databinding step. 
The observable plugin also uses KnockoutJS under the hood, but it can help you eliminate
the significant Knockout footprint (all those parenthesises!!); one page at the time in
your application. This will bring your code many steps closer to Aurelia. 

Durelia also allows you to create computed properties using the *computedFrom* decorator 
(exact same signature as in Aurelia).

In the bootstrapper of the application:
```javascript
durelia
    useObserveDecorator();
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

### 5. A dialog plugin wrapper that aligns the difference to Aurelia.
The dialog plugin for Durandal and the one for Aurelia are quite similar, but
there are a few difference. The "durelia-dialog" module contain two wrapper classes
that eliminates the differences by replicating the Aurelia signatures.

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
*PS! Notice that the ok and cancel methods has a second "this" argument.
This is not the same as in Aurelia, but was needed to integrate it into Durandal.*

### 6. Aligning router viewmodel activation and navigation with Aurelia
The router in Aurelia has a bit different implementation on:
* How it passes parsed route arguments from the browser URL to the activate method of the activating viewmodel.
* How you can use the router to generate navigation urls. 

Durelia to the rescue!

By enabling this feature you will alter the Durandal behavior making it identical to Aurelia:
```javascript
durelia
    useRouterModelActivation();
```
Example:

*Setting up a Durandal route (ensure you give the route a **name** property):*
```javascript
    router.map([{ 
        name: "NoteDetail", 
        route: "notes/:id", // Notice the :id argument
        title: "Note detail", 
        moduleId: "views/notes/notedetail", 
        nav: false 
    }]).buildNavigationModel();
```

*Durelia provides a NavigationController to help you construct urls to navigate to from routes.*
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

This will make the browser navigate to the following url

[...]**notes/5?someExtraProp=hello**

The ***"id"*** property of ***activationArgs*** is merged with the ***"id"*** parameter of the 
***route configuration***. 
Since The ***"someExtraProp"*** property of ***activationArgs*** will 
not find a route parameter matching the property name, it cannot be merged into the route; 
-the fallback strategy behavior therefore sends the property name and value as
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

While the Durandal behavior is to send each route argument as separate
string arguments when invoking the viewmodel activate method; Durelia (and Aurelia)
invokes it with a single object instead (if enabled). 
You may have noticed that the object sent as argument consists of the exact same properties 
and values as was sent in the ***navigateToRoute*** call earlier (see example above).

###Great intellisense and TypeScript interfaces
Durelia is implemented in typescript, and TypeScript typings are generated when building.
These are included along with the JavaScript files. This provides great intellisense
both for Durandal JavaScript or TypeScript projects if you use an editor that supports it.

Most of the classes in Durelia has an interface "twin". If you use Durelia with a TypeScript 
application and write unit tests using TypeScript, it will simplify mocking the dependencies
if you use the interface types for the constructor function parameters and inject the 
implementations through the inject decorator.

###Limitations
When using classes as ViewModels with Durandal, it has some problems on deciding what 
View (HTML file) to use with the ViewModel.
Durelia provides a decorator with the exact same signature as the one in Aurelia, so that
the ViewModel give a hint about where to look for the HTML View.

```javascript
import {useView} from "durelia-framework";

@useView("views/mypage.html")
export default class MyPage {
    [...]
}
```
***Editors remark**: I know you MVVM purists out there won't like this; but concider
it a temporary necessary evil. If you still follow a conventional consistent 
view/viewmodel naming convention these attributes can be removed once migration to Aurelia
is done.*

##Sample Application
The repository contains a sample application that covers the most common Durandal 
usage and how to do it with Durelia. The sample application is written using
TypeScript. Please disregard the bad UI design and lack of creativity in
feature set; the interesting part is the typescript code and the typical usage
scenarios it demonstrates. 
 

##Getting started

###Prerequisites
**a)** You have already; or you are ready to change your javascript/typescript 
code base into ES2015 class style implementations.

**b)** You have installed the Durelia javascript (and typings) f.ex. using bower:

```bash
bower install durelia --save

```

**c)** You have configured paths of your module loader:

Example:
```javascript
let require = {
    paths: {
        "durelia-binding":              "bower_components/dist/durelia-binding",
        "durelia-bootstrapper":         "bower_components/dist/durelia-bootstrapper",
        "durelia-dependency-injection": "bower_components/dist/durelia-dependency-injection",
        "durelia-dialog":               "bower_components/dist/durelia-dialog",
        "durelia-framework":            "bower_components/dist/durelia-framework",
        "durelia-logger":               "bower_components/dist/durelia-logger",
        "durelia-router":               "bower_components/dist/durelia-router",
        "durelia-templating":           "bower_components/dist/durelia-templating",
        
        "durandal": "../bower_components/durandal/js",
        "plugins": "../bower_components/durandal/js/plugins"
    }
};
```
**d)** You have called the durelia-bootstrapper to enable the desired features.
NB! This needs to happen after app.start() has finished asynchronously:

```javascript
app.start().then((result) => {

    dureliaBootstrapper
        .useES20015Promise()          // optional feature
        .useViewModelDefaultExports() // optional feature
        .useObserveDecorator()        // optional feature
        .useRouterModelActivation();  // optional feature

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