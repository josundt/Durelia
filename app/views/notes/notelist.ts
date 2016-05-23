import {BaseViewModel} from "base/viewmodel";
import {transient, inject, Lazy, useView} from "dependency-injection";
import {INoteRepository, NoteRepository, Note, ISortOrder} from "services/noterepository";
import {INoteViewModel, INoteViewModelActivationOptions, NoteViewModel} from "views/_shared/note";
import {IDialogHelper, DialogHelper} from "dialoghelper";

@useView("views/notes/notelist.html")
@transient
@inject(NoteRepository, Lazy.of(NoteViewModel), DialogHelper)
export default class NoteList extends BaseViewModel<void> {
    constructor(
        private noteRepository: INoteRepository,
        private createNotePartial: () => INoteViewModel,
        private dialogHelper: IDialogHelper
    ) {
        super();
    }
    heading: KnockoutObservable<string> = this.observable<string>();
    
    noteModels: KnockoutObservableArray<INoteViewModel> = this.observableArray<INoteViewModel>([]);
    
    sortProp: KnockoutObservable<string> = this.observable<string>();
    sortDesc: KnockoutObservable<boolean> = this.observable(false);
    
    sortBy(propName: string): Promise<void> {
        let isSameProp = propName === this.sortProp();
        this.sortProp(propName);
        if (isSameProp) {
            this.sortDesc(!this.sortDesc());
        }
        return this.loadData();
    }
    
    edit(noteViewModel: INoteViewModel): Promise<any> {
        location.assign(`#notes/${noteViewModel.note.id()}`);
        return Promise.resolve();
    }
    
    remove(noteViewModel: INoteViewModel): Promise<boolean> {
        return this.dialogHelper.confirm("Are you sure you want to delete this note?", "Delete?")
            .then(confirmed => {
                if (confirmed) {
                    return this.noteRepository.deleteById(noteViewModel.note.id())
                        .then((result) => {
                            this.noteModels.remove(noteViewModel);
                            return result;
                        });
                    
                } else {
                    return Promise.resolve(false);
                }
            });
    }
    
    add(): void {
        location.assign("#notes/-1");
    }
    
    loadData(): Promise<any> {
        return this.getNoteModels()
            .then((noteModels) => {
                this.noteModels(noteModels);
            });
    }
    
    getNoteModels(): Promise<INoteViewModel[]> {
        return this.noteRepository.get({ orderBy: { prop: this.sortProp(), desc: this.sortDesc() }})
            .then(notes => {
                let noteModels: INoteViewModel[] = [];
                return Promise.all(
                    notes.map(note => {
                        let notePartial = this.createNotePartial();
                        noteModels.push(notePartial); 
                        return notePartial.activate(this.getNotePartialActivationOptions(note));
                    })
                ).then(() => noteModels);
            });
    }
    
    private getNotePartialActivationOptions(note: Note) {
        return {
            note: note,
            readonly: true,
            owner: this,
            handlers: {
                edit: this.edit,
                remove: this.remove
            }
        };
    }
   
    activate(): Promise<any> {
        this.heading("Notes");
        return this.loadData();
    }
    
    deactivate(): Promise<any> {
        return Promise.all(this.noteModels().map(n => n.deactivate()))
            .then(super.deactivate);
    }
}
