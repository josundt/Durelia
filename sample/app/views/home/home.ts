import {IViewModel} from "durelia-viewmodel";
import {ITermsPartial, TermsPartial} from "views/home/home.terms";
import {transient, inject, observe, useView} from "durelia-framework";
import {INavigationController, NavigationController} from "durelia-router";
import {INoteListActivationModel} from "views/notes/notelist";

@observe(true)
@useView("views/home/home.html")
@transient
@inject(TermsPartial, NavigationController)
export default class Home implements IViewModel<void> {
        
    constructor(
        public termsPartial: ITermsPartial,
        private navigator: INavigationController
    ) {}
    
    goToNotesSamePageEditMode() {
        this.navigator.navigateToRoute<INoteListActivationModel>("Notes", { editMode: "samepage" });
    }

    goToNotesSeparatePageEditMode() {
        this.navigator.navigateToRoute<INoteListActivationModel>("Notes", { editMode: "separatepage" });
    }
    
    activate(): Promise<any> {
        return this.termsPartial.activate();
    }

    deactivate(): Promise<any> {
        return this.termsPartial.deactivate();
    }
}
