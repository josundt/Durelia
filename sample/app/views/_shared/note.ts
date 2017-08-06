import { Note } from "services/noterepository";
import { useView } from "durelia-framework";
import { IViewModel } from "durelia-viewmodel";

export interface INoteViewModel extends IViewModel<INoteViewModelActivationOptions> {
    note: Note;
}

export interface INoteViewModelActivationOptions {
    note: Note;
    readonly?: boolean;
    handlers?: INoteViewModelEventHandlers;
}

interface INoteViewModelEventHandlers {
    edit?(note: Note): Promise<any>;
    save?(note: Note): Promise<any>;
    remove?(note: Note): Promise<any>;
    cancel?(note: Note): Promise<any>;
}

@useView("views/_shared/note")
export default class NoteViewModel implements INoteViewModel {
    note: Note;
    readonly: boolean = true;

    activate(model: INoteViewModelActivationOptions): Promise<any> {
        this.note = model.note;
        this.readonly = !!model.readonly;
        this.handlers = model.handlers;
        return Promise.resolve();
    }

    deactivate(): Promise<any> {
        this.handlers = undefined;
        return Promise.resolve();
    }

    edit(): Promise<any> {
        return this.invokeEvent(this.handlers ? this.handlers.edit : undefined);
    }

    save(): Promise<any> {
        return this.invokeEvent(this.handlers ? this.handlers.save : undefined);
    }

    remove(): Promise<any> {
        return this.invokeEvent(this.handlers ? this.handlers.remove : undefined);
    }

    cancel(): Promise<any> {
        return this.invokeEvent(this.handlers ? this.handlers.cancel : undefined);
    }

    private invokeEvent(handler: ((note: Note) => Promise<any>) | undefined): Promise<any> {
        return handler
            ? handler(this.note)
            : Promise.resolve();
    }

    private handlers: INoteViewModelEventHandlers | undefined = {};
}
