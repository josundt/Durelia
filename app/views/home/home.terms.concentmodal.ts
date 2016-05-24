import {BaseModalViewModel, IModalViewModel} from "base/viewmodel";
import {IDialogController, DialogController} from "app-dialog";
import {transient, inject, observe, useView} from "app-framework";

export interface ITermsPartialModalModel { text: string; }

export interface ITermsPartialModalResult { agreed: boolean; }

export interface ITermsPartialModal extends IModalViewModel<ITermsPartialModalModel, ITermsPartialModalResult> {}

@observe(true)
@useView("views/home/home.terms.concentmodal.html")
@inject(DialogController)
export class TermsPartialModal extends BaseModalViewModel<ITermsPartialModalModel, ITermsPartialModalResult> {
    
    constructor(
        dialogController: IDialogController<ITermsPartialModalResult>
    ) {
        super(dialogController);
    }
    
    heading: string;
    
    text: string;
    
    activate(options: ITermsPartialModalModel): Promise<any> {
        this.text = options.text;
        this.heading = "Home Partial Modal";
        return Promise.resolve(true);
    }
        
    agree(): void {
        this.ok({ agreed: true });
    }
    
    disagree(): void {
        this.cancel({ agreed: false });
    }
}