import {IViewModel} from "durelia-viewmodel";
import {ITermsPartial, TermsPartial} from "views/home/home.terms";
import {transient, inject, observe, useView} from "durelia-framework";

@observe(true)
@useView("views/home/home.html")
@transient
@inject(TermsPartial)
export default class Home implements IViewModel<void> {
        
    constructor(
        public termsPartial: ITermsPartial
    ) {}
    
    heading: string;
    
    activate(): Promise<any> {
        this.heading = "Home";
        return this.termsPartial.activate();
    }

    deactivate(): Promise<any> {
        return this.termsPartial.deactivate();
    }
}
