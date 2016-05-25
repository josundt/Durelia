import {Note} from "services/noterepository";
import {transient} from "durelia-framework";
import {IViewModel} from "durelia-viewmodel";

export interface INoteViewModel extends IViewModel<INoteViewModelActivationOptions> {
    note: Note;
}

export interface INoteViewModelActivationOptions {
    note: Note;
    owner: IViewModel<any>;
    readonly?: boolean;
    handlers?: INoteViewModelEventHandlers;
}

interface INoteViewModelEventHandlers {
    edit?: (noteViewModel: INoteViewModel) => Promise<any>;
    save?: (noteViewModel: INoteViewModel) => Promise<any>;
    remove?: (noteViewModel: INoteViewModel) => Promise<any>;
    cancel?: (noteViewModel: INoteViewModel) => Promise<any>;
}

@transient
export class NoteViewModel implements INoteViewModel {
    note: Note;
    readonly: boolean = true;
    
    edit(): Promise<any> {
        return this.invokeEvent(this.handlers.edit);
    }
    save(): Promise<any> {
        return this.invokeEvent(this.handlers.save);
    }
    remove(): Promise<any> {
        return this.invokeEvent(this.handlers.remove);
    }
    cancel(): Promise<any> {
        return this.invokeEvent(this.handlers.cancel);
    }
    private invokeEvent(handler: (noteViewModel: NoteViewModel) => Promise<any>) {
        return handler
            ? handler.call(this.owner, this)
            : Promise.resolve();
    }

    private owner: IViewModel<any>;
    private handlers: INoteViewModelEventHandlers;

    activate(options: INoteViewModelActivationOptions): Promise<any> {
        this.note = options.note;
        this.readonly = !!options.readonly;
        this.owner = options.owner;
        this.handlers = options.handlers || {};
        return Promise.resolve();
    }
    
    deactivate(): Promise<any> {
        return Promise.resolve();
    }
}
