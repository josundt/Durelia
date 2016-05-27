#Durelia
##Durandal extension
###-enabling a step-by-step transition from Durandal towards Aurelia

**Durelia** extends Durandal with many of the features from Aurelia, 
and was implemented to simplify the migration path of an existing application 
from Durandal to Aurelia by enabling a step by step refactoring path
without breaking existing functionality.

##Durelia helps you with the following:

###1. ES2015 Promises replacing JQueryPromise
Durandal is by default using JQueryPromise for async operations.
Durelia can alter Durandals behavior, making it use the native ES2015 Promise instead.

**Example (when you target only modern modern browers, or already have a polyfill for older browsers:**
```javascript
import {dureliaBootstrapper} from "durelia-bootstrapper";

dureliaBootstrapper
    .useES20015Promise();
```

**Example (when you want to install Q as ES2015 Promise a polyfill as you enable ES2015 Promise for Durandal):**
```javascript
import {dureliaBootstrapper} from "durelia-bootstrapper";
import * as Bluebird from "bluebird";

dureliaBootstrapper
    .useES20015Promise(Q.Promise);
```  

**Example (when you want to install Bluebird as ES2015 Promise a polyfill as you enable ES2015 Promise for Durandal):**
```javascript
import {dureliaBootstrapper} from "durelia-bootstrapper";
import * as Bluebird from "bluebird";

dureliaBootstrapper
    .useES20015Promise(Bluebird);
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

###3. Enabling Durandal Router to look for the *default export* class/object 
When Durandal was released, it was dependent on a 3rd party module loader like RequireJS, 
and most Durandal applications are using RequireJS as a module loader.
This module loader had some limitations compared to the new ES2015 module import/export spec.
ES2015 allow you to export multiple classes, variables or functions from a module, and allows 
you to have a single default export in a module.
Durelia has a opt-in hook to enable the Durandal router look for the default export of a module
(class or object) when deciding what to use as the ViewModel for the ViewModel/Model pair.
```javascript
export default class MyPage { // Notice the "default" keyword
}
```

###4. Enabling the Durandal Observable plugin on a per-viewmodel basis
The biggest footprint of a Durandal application javascript/typescript codebase that distinguish
it from an Aurelia codebase, is the extensive usage of Knockout.
But Durandal provides a plugin called "observable" that leverages automatic creation of property getters/setters
wrapping the observables for all members of a viewmodel just before databinding happens. 
This makes it possible to eliminate the Knockout footprint (all those parenthesises!!) 
page by page in your application. 

Durelia also allow you to create computed properties using the *computedFrom* decorator 
(same signature as in Aurelia).

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
there are a few difference. The durelia-dialog is a wrapper that eliminates
the differences.

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

### 6. Aligning router activation and navigation with Aurelia
The router in Aurelia has a bit different implementation on:
* How it passes parsed route arguments the activate method of the activating viewmodel.
* How you can use the router to generate navigation urls. 

Durelia to the rescue!

By enabling this feature you will get the exact same behavior as in Aurelia:
```javascript
durelia
    useRouterModelActivation();
```
Example:

*Setting up a durandal route (ensure you give the route a name property):*
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

This will make the browser navigate to the url
**notes/5?someExtraProp=hello**
(This feature does not exist in Durandal).

The id prop of the activationArgs is merged with the id parameter of the route configuration.
A route param named someExtraProp is not found in the route configuration, 
the property and name is therefore sent as queryString args instead.

*The activate method of the activating viewmodel will then be called:*
```javascript
export class NoteDetails {
    activate(activationModel) {
        [...]
    }
}
```
*...and the activationModel will be an object like this:*
```javascript
{
    id: 5,
    someExtraProp: "hello"
}
```

As you may have noticed, this is an object with the exact same pros and values
as was sent in the navigateToRoute call. 
(Only properties with integer values (and of course strings) get the same type
when the activate method is invoked.

(PS! Original behavior in Durandal is to send each route argument as separate
string arguments to the activate method.) 


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
*Editors remark: I know you MVVM purists out there won't like this; but concider
it a temporary necessary evil. 

###Prerequisites
**a)** You have already; or are planning to change your javascript/typescript 
code base into ES2015 class implementations.

**b)** You have installed the durelia javascript (and typings) f.ex. using bower:

```bash
bower install https://github.com/josundt/Durelia.git#1.0.0

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

If you utilize all the features of Durelia, the JavaScript/TypeScript code of your application
is more or less already Aurelia compliant code.

If you used every Durelia feature, you are more or less only left with one change
to use the existing code base with Aurelia:
Changing one letter in the durelia related import statements:
Change the initial "d" with an "a"!

:) 