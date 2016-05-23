import {BaseModalViewModel, IModalViewModel} from "base/viewmodel";
import {IDialogHelper, DialogHelper} from "dialoghelper";
import {transient, inject, useView} from "dependency-injection";

export interface ITermsPartialModalOptions { text: string; }

export interface ITermsPartialModalResult { agreed: boolean; }

export interface ITermsPartialModal extends IModalViewModel<ITermsPartialModalOptions, ITermsPartialModalResult> {}

@useView("views/home/home.terms.concentmodal.html")
@inject(DialogHelper)
export class TermsPartialModal extends BaseModalViewModel<ITermsPartialModalOptions, ITermsPartialModalResult> {
    
    constructor(
        dialogHelper: IDialogHelper
    ) {
        super(dialogHelper);
    }
    
    heading: KnockoutObservable<string> = this.observable<string>();
    
    text: KnockoutObservable<string> = this.observable<string>();
    
    activate(options: ITermsPartialModalOptions): Promise<any> {
        this.text(options.text);
        this.heading("Home Partial Modal")
        return Promise.resolve(true);
    }
        
    agree(): void {
        this._closeDialog({ agreed: true });
    }
    
    disagree(): void {
        this._closeDialog({ agreed: false });
    }
}