import {inject, useView} from "durelia-framework";
import {IDialogController, DialogController} from "durelia-dialog";
import {IDialogViewModel} from "durelia-viewmodel";

export interface IMessageBoxModel {
    message: string;
    title?: string; //= title || MessageBox.defaultTitle;
    options?:  string[]; //= options || MessageBox.defaultOptions;
    cancelOptionIndex?: number;
}

@useView("views/_shared/messagebox.html")
@inject(DialogController)
export class MessageBox implements IDialogViewModel<IMessageBoxModel, string> {
    constructor(
        private controller: IDialogController<string>
    ) {}

    message: string;
    title: string;
    options: string[];
    private cancelOptionIndex: number;

    activate(model: IMessageBoxModel): Promise<any> {
        this.message = model.message;
        this.title = model.title;
        this.options = model.options || ["OK"];
        this.cancelOptionIndex = model.cancelOptionIndex || -1;
        return Promise.resolve();
    }

    selectOption(option: string) {
        if (this.options.indexOf(option) === this.cancelOptionIndex) {
            this.controller.cancel(option, this);
        } else {
            this.controller.ok(option, this);
        }
    }
}