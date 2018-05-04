import { inject, Lazy, observe } from "durelia-framework";
import { IViewModel } from "durelia-viewmodel";
import { INavigationController, NavigationController } from "durelia-router";
import { NoteRepository, INoteRepository, Note } from "../../services/noterepository";
import { CommonDialogs, ICommonDialogs } from "../../services/common-dialogs";
import { INoteViewModelActivationOptions } from "../_shared/note";

export interface INoteDetailActivationModel {
    id: number;
}

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

    async activate(model: INoteDetailActivationModel): Promise<any> {
        if (model.id < 0) {
            this.heading = "New note";
            this.hasUnsavedChanges = true;
            this.note = this.noteRepository.createNew();
            return Promise.resolve();
        } else {
            this.heading = "Edit note";
            this.note = await this.noteRepository.getById(model.id);
        }
    }

    async canDeactivate(): Promise<boolean> {
        let result = true;
        if (this.hasUnsavedChanges) {
            const buttonTexts = ["Save", "Abandon changes", "Stay on page"];
            const dialogResult = await this.commonDialogs.messageBox("Do you want to save the note before leaving?", "Save changes", buttonTexts, 2);
            if (dialogResult.wasCancelled) {
                result = false;
            }
            if (dialogResult.output === buttonTexts[0]) {
                await this.save(this.note, true);
            }
        }
        return result;
    }

    deactivate(): Promise<any> {
        return Promise.resolve();
    }

    async save(note: Note, skipGoBack?: boolean): Promise<any> {

        if (note.id >= 0) {
            await this.noteRepository.update(note);
        } else {
            await this.noteRepository.add(note);
        }

        this.hasUnsavedChanges = false;

        await this.commonDialogs.messageBox("The note was saved", "Saved!", ["OK"]);

        if (!skipGoBack) {
            this.back();
        }
    }

    async remove(note: Note): Promise<boolean> {
        let wasDeleted = false;
        const confirmed = await this.commonDialogs.confirm("Are you sure you want to delete this note?", "Delete?");
        if (confirmed) {
            wasDeleted = await this.noteRepository.deleteById(note.id);
            this.hasUnsavedChanges = false;
            this.back();
        }
        return wasDeleted;
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
}