import {BaseViewModel, IViewModel, IModalViewModel} from "base/viewmodel";
import {ITermsPartialModal, TermsPartialModal, ITermsPartialModalOptions, ITermsPartialModalResult} from "views/home/home.terms.concentmodal";
import {IDialogHelper, DialogHelper} from "dialoghelper";
import {transient, inject, useView} from "dependency-injection";

export interface ITermsPartial extends IViewModel<void> {}

@useView("views/home/home.terms.html")
@transient
@inject(DialogHelper)
export class TermsPartial extends BaseViewModel<void> {
    
    constructor(
        private dialogHelper: IDialogHelper
    ) {
        super();
    }
    
    heading: KnockoutObservable<string> = this.observable<string>();
    
    agreed: KnockoutObservable<boolean> = this.observable(false);
    
    agreedText: KnockoutComputed<string> = this.computed(this.getAgreedText);
        
    openDialog(): Promise<any> {
        return this.dialogHelper.showModal<ITermsPartialModalOptions, ITermsPartialModalResult>(
            TermsPartialModal, 
            { text: "Do you agree to the terms?"})
            .then(result => {
                this.agreed(result.agreed);
            });
    }
    
    activate(): Promise<any> {
        this.heading("Terms Partial");
        return Promise.resolve(true);
    }
    
    private getAgreedText(): string {
        let agreed = this.agreed();
        return `The user ${agreed ? "HAS " : "has NOT "}agreed to the terms`;
    }
}