import {inject, observe, useView} from "durelia-framework";
import {IViewModel} from "durelia-viewmodel";
import {INavigationController, NavigationController} from "durelia-router";
import {INoteListActivationModel} from "views/notes/notelist";

@observe(true)
@useView("views/home/home.html")
export default class Home implements IViewModel<void> {

    activate(): Promise<any> {
        return Promise.resolve();
    }

    deactivate(): Promise<any> {
        return Promise.resolve();
    }    
}
