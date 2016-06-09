import {IViewModel} from "durelia-viewmodel";
import {transient, inject, observe, useView} from "durelia-framework";
import {INavigationController, NavigationController} from "durelia-router";
import {INoteListActivationModel} from "views/notes/notelist";

@observe(true)
@useView("views/home/home.html")
@transient
@inject(NavigationController)
export default class Home implements IViewModel<void> {
        
    constructor(
        private navigator: INavigationController
    ) {}

    activate(): Promise<any> {
        return Promise.resolve();
    }

    deactivate(): Promise<any> {
        return Promise.resolve();
    }
    
    goToNotesSamePageEditMode() {
        this.navigator.navigateToRoute<INoteListActivationModel>("Notes", { editMode: "samepage" });
    }

    goToNotesSeparatePageEditMode() {
        this.navigator.navigateToRoute<INoteListActivationModel>("Notes", { editMode: "separatepage" });
    }
    
}
