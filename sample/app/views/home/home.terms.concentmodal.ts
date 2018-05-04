import { inject, observe } from "durelia-framework";
import { IDialogViewModel } from "durelia-viewmodel";
import { IDialogController, DialogController } from "durelia-dialog";

export interface ITermsPartialModalActivationModel { text: string; }

export interface ITermsPartialModalOutput { agreed: boolean; }

export interface ITermsPartialModal extends IDialogViewModel<ITermsPartialModalActivationModel, ITermsPartialModalOutput> {}

@observe(true)
@inject(DialogController)
export class TermsPartialModal implements IDialogViewModel<ITermsPartialModalActivationModel, ITermsPartialModalOutput> {

    constructor(
        private controller: IDialogController<ITermsPartialModalOutput | null>
    ) {}

    heading: string;
    text: string;

    activate(model: ITermsPartialModalActivationModel): Promise<any> {
        this.text = model.text;
        this.heading = "Home Partial Modal";
        return Promise.resolve();
    }

    deactivate(): Promise<any> {
        return Promise.resolve();
    }

    agree(): void {
        this.controller.ok({ agreed: true }, this);
    }

    disagree(): void {
        this.controller.ok({ agreed: false }, this);
    }

    cancel(): void {
        this.controller.cancel(null, this);
    }

}