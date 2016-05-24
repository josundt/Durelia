import {BaseViewModel, IViewModel, IModalViewModel, computedFrom, observe} from "base/viewmodel";
import {ITermsPartialModal, TermsPartialModal, ITermsPartialModalOptions, ITermsPartialModalResult} from "views/home/home.terms.concentmodal";
import {IDialogHelper, DialogHelper} from "dialoghelper";
import {transient, inject, useView} from "dependency-injection";

export interface ITermsPartial extends IViewModel<void> {}

@useView("views/home/home.terms.html")
@observe
@transient
@inject(DialogHelper)
export class TermsPartial extends BaseViewModel<void> {
    
    constructor(
        private dialogHelper: IDialogHelper
    ) {
        super();
    }
    
    heading: string;
    
    agreed: boolean = false;
    
    @computedFrom<TermsPartial>("agreed")
    get agreedText(): string {
        let agreed = this.agreed;
        return `The user ${agreed ? "HAS" : "has NOT"} agreed to the terms`;
    };
        
    openDialog(): Promise<any> {
        return this.dialogHelper.showModal<ITermsPartialModalOptions, ITermsPartialModalResult>(
            TermsPartialModal, 
            { text: "Do you agree to the terms?"})
            .then(result => {
                this.agreed = result.agreed;
            });
    }
    
    activate(): Promise<any> {
        this.heading = "Terms Partial";
        return Promise.resolve(true);
    }
    
    
}