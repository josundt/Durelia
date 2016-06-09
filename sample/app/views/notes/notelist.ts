import {IViewModel} from "durelia-viewmodel";
import {transient, inject, observe, useView, computedFrom} from "durelia-framework";
import {INoteDetailActivationModel} from "views/notes/notedetail";
import {INoteRepository, NoteRepository, Note, ISortOrder} from "services/noterepository";
import {INoteViewModelActivationOptions} from "views/_shared/note";
import {ICommonDialogs, CommonDialogs} from "services/common-dialogs";
import {INavigationController, NavigationController} from "durelia-router";

interface LabeledItem<T> {
    text: string;
    value: T;
}

export interface INoteListActivationModel {
    editMode?: "samepage" | "separatepage";
}

@observe(true)
@useView("views/notes/notelist.html")
@transient
@inject(NoteRepository, CommonDialogs, NavigationController)
export default class NoteList implements IViewModel<INoteListActivationModel> {
    constructor(
        private noteRepository: INoteRepository,
        private commonDialogs: ICommonDialogs,
        private navigator: INavigationController
    ) {}
    
    private allowEditing: boolean = false;

    hasUnsavedChanges: boolean = false;

    notes: Note[] = [];

    sortPropOptions: LabeledItem<string>[] = [
        { text: "date", value: "modified" }, 
        { text: "content", value: "content" }
    ];

    sortProp: LabeledItem<string> = this.sortPropOptions[0];
    sortDesc: boolean = false;
    
    @computedFrom("allowEditing")
    get toggleEditModeButtonText() {
        return `Switch to ${this.allowEditing ? "separate-page" : "same-page"} edit-mode`;
    }
    
    activate(model: INoteListActivationModel): Promise<any> {
        this.allowEditing = model && model.editMode === "samepage";
        return this.loadData();
    }
    
    deactivate(): Promise<any> {
        return Promise.resolve();
    }

    toggleSortProp() {
        let curIdx = this.sortPropOptions.indexOf(this.sortProp);
        this.sortProp = (curIdx === this.sortPropOptions.length - 1)
            ? this.sortPropOptions[0]
            : this.sortPropOptions[curIdx + 1];
        this.sort();
    }

    toggleSortDirection() {
        this.sortDesc = !this.sortDesc;
        this.sort();
    }
    
    toggleEditMode() {
        this.navigator.navigateToRoute<INoteListActivationModel>("Notes", { editMode: this.allowEditing ? "separatepage" : "samepage" });
    }


    edit(note: Note): Promise<any> {
        this.navigator.navigateToRoute<INoteDetailActivationModel>("NoteDetail", { id: note.id });
        return Promise.resolve();
    }
    
    remove(note: Note): Promise<boolean> {
        return this.commonDialogs.confirm("Are you sure you want to delete this note?", "Delete?")
            .then(confirmed => {
                if (confirmed) {
                    return this.noteRepository.deleteById(note.id)
                        .then((result) => {
                            this.notes.splice(this.notes.indexOf(note), 1);
                            return result;
                        });
                    
                } else {
                    return Promise.resolve(false);
                }
            });
    }
    
    add(): Promise<any> {
        if (this.allowEditing) {
            this.notes.push(this.noteRepository.createNew());
        } else {
            this.navigator.navigateToRoute<INoteDetailActivationModel>("NoteDetail", { id: -1 });
        }
        return Promise.resolve();
    }
    
    save(note: Note): Promise<any> {
        let promise = note.id >= 0
            ? this.noteRepository.update(note)
            : this.noteRepository.add(note);

        return promise.then(() => {
            this.hasUnsavedChanges = false;
            this.sort();
            return this.commonDialogs.messageBox("The note was saved", "Saved!", ["OK"]);
        });
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
   
    private loadData(): Promise<any> {
        return this.noteRepository.get({ 
            orderBy: { 
                prop: this.sortProp.value, 
                desc: this.sortDesc 
            }
        }).then(notes => {
            this.notes = notes;
        });
    }
    
    private sort() {
        let prop = this.sortProp.value;
        let desc = this.sortDesc;
        
        let sortFn = (noteA: Note, noteB: Note) => {
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
