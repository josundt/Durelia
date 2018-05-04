import { inject, computedFrom, observe } from "durelia-framework";
import { IViewModel } from "durelia-viewmodel";
import { IDialogService, DialogService } from "durelia-dialog";
import { TermsPartialModal, ITermsPartialModalActivationModel, ITermsPartialModalOutput } from "./home.terms.concentmodal";

export interface ITermsPartial extends IViewModel<void> {}

@observe(true)
@inject(DialogService)
export default class TermsPartial implements ITermsPartial {

    constructor(
        private dialogService: IDialogService
    ) {}

    heading: string;
    agreed: boolean = false;

    @computedFrom("agreed")
    get agreedText(): string {
        const agreed = this.agreed;
        return `The user ${agreed ? "HAS" : "has NOT"} agreed to the terms`;
    }

    activate(): Promise<any> {
        this.heading = "Terms";
        return Promise.resolve(true);
    }

    deactivate(): Promise<any> {
        const observables: {} = <any>this["__observables__"];
        if (observables) {
            for (const key of Object.keys(observables)) {
                const o = observables[key];
                if (o["dispose"] && typeof o["dispose"] === "function") {
                    o["dispose"]();
                }
            }
        }
        return Promise.resolve();
    }

    async openDialog(): Promise<any> {
        const model: ITermsPartialModalActivationModel = { text: "Do you agree to the terms?" };
        const result = await this.dialogService.open<ITermsPartialModalActivationModel, ITermsPartialModalOutput>({
            viewModel: TermsPartialModal,
            model: model
        });
        this.agreed = !result.wasCancelled && result.output.agreed;
    }
}