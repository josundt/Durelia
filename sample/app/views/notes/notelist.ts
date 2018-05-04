import { inject, Lazy, observe, computedFrom } from "durelia-framework";
import { IViewModel } from "durelia-viewmodel";
import { INavigationController, NavigationController } from "durelia-router";
import { NoteRepository, INoteRepository, Note } from "../../services/noterepository";
import { CommonDialogs, ICommonDialogs } from "../../services/common-dialogs";
import { INoteDetailActivationModel } from "./notedetail";
import { INoteViewModelActivationOptions } from "../_shared/note";

interface LabeledItem<T> {
    text: string;
    value: T;
}

export interface INoteListActivationModel {
    editMode?: "samepage" | "separatepage";
}

@observe(true)
@inject(Lazy.of(NoteRepository), CommonDialogs, NavigationController)
export default class NoteList implements IViewModel<INoteListActivationModel> {
    constructor(
        getNoteRepository: () => INoteRepository,
        private commonDialogs: ICommonDialogs,
        private navigator: INavigationController
    ) {
        this.noteRepository = getNoteRepository();

    }

    private noteRepository: INoteRepository;
    private allowEditing: boolean = false;

    hasUnsavedChanges: boolean = false;

    notes: Note[] = [];

    sortPropOptions: Array<LabeledItem<string>> = [
        { text: "date", value: "modified" },
        { text: "content", value: "content" }
    ];

    sortProp: LabeledItem<string> = this.sortPropOptions[0];
    sortDesc: boolean = false;

    @computedFrom("allowEditing")
    get toggleEditModeButtonText(): string {
        return `Switch to ${this.allowEditing ? "separate-page" : "same-page"} edit-mode`;
    }

    activate(model: INoteListActivationModel): Promise<any> {
        this.allowEditing = model && model.editMode === "samepage";
        return this.loadData();
    }

    deactivate(): Promise<any> {
        return Promise.resolve();
    }

    toggleSortProp(): void {
        const curIdx = this.sortPropOptions.indexOf(this.sortProp);
        this.sortProp = (curIdx === this.sortPropOptions.length - 1)
            ? this.sortPropOptions[0]
            : this.sortPropOptions[curIdx + 1];
        this.sort();
    }

    toggleSortDirection(): void {
        this.sortDesc = !this.sortDesc;
        this.sort();
    }

    toggleEditMode(): void {
        this.navigator.navigateToRoute<INoteListActivationModel>("Notes", { editMode: this.allowEditing ? "separatepage" : "samepage" });
    }

    edit(note: Note): Promise<any> {
        this.navigator.navigateToRoute<INoteDetailActivationModel>("NoteDetail", { id: note.id });
        return Promise.resolve();
    }

    async remove(note: Note): Promise<boolean> {
        let wasDeleted = false;
        const confirmed = await this.commonDialogs.confirm("Are you sure you want to delete this note?", "Delete?");
        if (confirmed) {
            wasDeleted = await this.noteRepository.deleteById(note.id);
            this.notes.splice(this.notes.indexOf(note), 1);
        }
        return wasDeleted;
    }

    add(): Promise<any> {
        if (this.allowEditing) {
            this.notes.push(this.noteRepository.createNew());
        } else {
            this.navigator.navigateToRoute<INoteDetailActivationModel>("NoteDetail", { id: -1 });
        }
        return Promise.resolve();
    }

    async save(note: Note): Promise<any> {
        if (note.id >= 0) {
            await this.noteRepository.update(note);
        } else {
            await this.noteRepository.add(note);
        }

        this.hasUnsavedChanges = false;
        this.sort();

        await this.commonDialogs.messageBox("The note was saved", "Saved!", ["OK"]);
    }

    getNoteViewModelActivationData(note: Note): INoteViewModelActivationOptions {
        return {
            note: note,
            readonly: !this.allowEditing,
            handlers: {
                edit: this.allowEditing ? undefined : n => this.edit(n),
                remove: n => this.remove(n),
                save: this.allowEditing ? n => this.save(n) : undefined
            }
        };
    }

    private async loadData(): Promise<any> {
        this.notes = await this.noteRepository.get({
            orderBy: {
                prop: this.sortProp.value,
                desc: this.sortDesc
            }
        });
    }

    private sort(): void {
        const prop = this.sortProp.value;
        const desc = this.sortDesc;

        const sortFn = (noteA: Note, noteB: Note) => {
            let valA: any = noteA[prop];
            let valB: any = noteB[prop];
            if (valA instanceof Date && valB instanceof Date) {
                valA = valA.getTime();
                valB = valB.getTime();
            }
            return valA < valB
                ? (desc ? 1 : -1)
                : (desc ? -1 : 1);
        };
        this.notes.sort(sortFn);
    }
}
