import {inject, Lazy, observe, useView} from "durelia-framework";
import {IViewModel} from "durelia-viewmodel";
import {INoteRepository, NoteRepository, Note} from "services/noterepository";
import {INoteViewModel, INoteViewModelActivationOptions} from "views/_shared/note";
import {ICommonDialogs, CommonDialogs} from "services/common-dialogs";
import {INavigationController, NavigationController} from "durelia-router";

export interface INoteDetailActivationModel {
    id: number;
}

@useView("views/notes/notedetail.html")
@observe(true)
@inject(Lazy.of(NoteRepository), CommonDialogs, NavigationController)
export default class NoteDetail implements IViewModel<INoteDetailActivationModel> {
    constructor(
        getNoteRepository: () => INoteRepository,
        private commonDialogs: ICommonDialogs,
        private navigator: INavigationController
    ) {
        
        this.noteRepository = getNoteRepository();
    }

    private noteRepository: INoteRepository;
    heading: string;
    hasUnsavedChanges: boolean = false;
    note: Note;

    activate(model: INoteDetailActivationModel): Promise<any> {
        if (model.id < 0) {
            this.heading = "New note";
            this.hasUnsavedChanges = true;
            this.note = this.noteRepository.createNew();
            return Promise.resolve();
        } else {
            this.heading = "Edit note";
            return this.noteRepository.getById(model.id).then(note => {
                this.note = note;
            });
        }
    }
    
    canDeactivate(): Promise<boolean> {
        if (this.hasUnsavedChanges) {
            let buttonTexts = ["Save", "Abandon changes", "Stay on page"];
            return this.commonDialogs.messageBox("Do you want to save the note before leaving?", "Save changes", buttonTexts, 2)
                .then(result => {
                    if (result.wasCancelled) {
                        return Promise.resolve(false);
                    } else if (result.output === buttonTexts[1]) {
                        return Promise.resolve(true);
                    } else {
                        return this.save(this.note, true).then(() => true); 
                    }
                });
        } else {
            return Promise.resolve(true);
        }
    }

    deactivate(): Promise<any> {
        return Promise.resolve();
    }
    
    save(note: Note, skipGoBack?: boolean): Promise<any> {
        let promise = note.id >= 0
            ? this.noteRepository.update(note)
            : this.noteRepository.add(note);

        return promise.then(() => {
            this.hasUnsavedChanges = false;
            
            return this.commonDialogs.messageBox("The note was saved", "Saved!", ["OK"]);

        }).then(() => skipGoBack ? Promise.resolve() : this.back());
    }

    remove(note: Note): Promise<boolean> {
        return this.commonDialogs.confirm("Are you sure you want to delete this note?", "Delete?")
            .then(confirmed => {
                if (confirmed) {
                    return this.noteRepository.deleteById(note.id)
                        .then((result) => {
                            this.hasUnsavedChanges = false;
                            this.back();
                            return result;
                        });
                    
                } else {
                    return Promise.resolve(false);
                }
            });
    }

    add(): void {
        this.navigator.navigateToRoute<INoteDetailActivationModel>("NoteDetail", { id: -1 });
    }

    back(): void {
        this.navigator.navigateBack();
    }

    cancel(): Promise<any> {
        this.back();
        return Promise.resolve();
    }

    getNoteViewModelActivationData(note: Note): INoteViewModelActivationOptions {
        return {
            note: note,
            readonly: false,
            handlers: {
                save: n => this.save(n),
                remove: n => this.remove(n),
                cancel: n => this.cancel()
            }
        };
    }

    private onNoteContentChange() {
        this.hasUnsavedChanges = true;
    }
    
}