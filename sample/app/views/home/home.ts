import {IViewModel} from "durelia-viewmodel";
import {ITermsPartial, TermsPartial} from "views/home/home.terms";
import {transient, inject, observe, useView} from "durelia-framework";
import {INavigationController, NavigationController} from "durelia-router";

@observe(true)
@useView("views/home/home.html")
@transient
@inject(TermsPartial, NavigationController)
export default class Home implements IViewModel<void> {
        
    constructor(
        public termsPartial: ITermsPartial,
        private navigator: INavigationController
    ) {}
    
    heading: string;
    
    goToNotes() {
        this.navigator.navigateToRoute("Notes");
    }
    
    activate(): Promise<any> {
        this.heading = "Home";
        return this.termsPartial.activate();
    }

    deactivate(): Promise<any> {
        return this.termsPartial.deactivate();
    }
}
