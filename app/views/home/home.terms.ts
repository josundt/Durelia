import {BaseViewModel, IViewModel, IModalViewModel} from "base/viewmodel";
import {ITermsPartialModal, TermsPartialModal, ITermsPartialModalModel, ITermsPartialModalResult} from "views/home/home.terms.concentmodal";
import {IDialogService, DialogService} from "app-dialog";
import {transient, inject, computedFrom, observe, useView} from "app-framework";

export interface ITermsPartial extends IViewModel<void> {}

@useView("views/home/home.terms.html")
@observe(true)
@transient
@inject(DialogService)
export class TermsPartial extends BaseViewModel<void> {
    
    constructor(
        private dialogService: IDialogService
    ) {
        super();
    }
    
    heading: string;
    
    agreed: boolean = false;
    
    @computedFrom("agreed")
    get agreedText(): string {
        let agreed = this.agreed;
        return `The user ${agreed ? "HAS" : "has NOT"} agreed to the terms`;
    }
        
    openDialog(): Promise<any> {
        let model: ITermsPartialModalModel = { text: "Do you agree to the terms?" };
        return this.dialogService.open<ITermsPartialModalModel, ITermsPartialModalResult>({
            viewModel: TermsPartialModal, 
            model: model
        }).then(result => {
            this.agreed = result.output.agreed;
        });
    }
    
    activate(): Promise<any> {
        this.heading = "Terms Partial";
        return Promise.resolve(true);
    }
    
    
}