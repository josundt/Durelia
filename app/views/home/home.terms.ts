import {IViewModel, IDialogViewModel} from "durelia-viewmodel";
import {ITermsPartialModal, TermsPartialModal, ITermsPartialModalModel, ITermsPartialModalOutput} from "views/home/home.terms.concentmodal";
import {IDialogService, DialogService} from "durelia-dialog";
import {transient, inject, computedFrom, observe, useView} from "durelia-framework";

export interface ITermsPartial extends IViewModel<void> {}

@useView("views/home/home.terms.html")
@observe(true)
@transient
@inject(DialogService)
export class TermsPartial implements IViewModel<void> {
    
    constructor(
        private dialogService: IDialogService
    ) {}
    
    heading: string;
    
    agreed: boolean = false;
    
    @computedFrom("agreed")
    get agreedText(): string {
        let agreed = this.agreed;
        return `The user ${agreed ? "HAS" : "has NOT"} agreed to the terms`;
    }
        
    openDialog(): Promise<any> {
        let model: ITermsPartialModalModel = { text: "Do you agree to the terms?" };
        return this.dialogService.open<ITermsPartialModalModel, ITermsPartialModalOutput>({
            viewModel: TermsPartialModal, 
            model: model
        }).then(result => {
            if (!result.wasCancelled) {
                this.agreed = result.output.agreed;
            }
        });
    }
    
    activate(): Promise<any> {
        this.heading = "Terms Partial";
        return Promise.resolve(true);
    }
    
    deactivate(): Promise<any> {
        return Promise.resolve();
    }
    
    
}