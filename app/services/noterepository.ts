import * as ko from "knockout";
import * as koMapping from "knockout.mapping";
import {singleton} from "dependency-injection";

ko.mapping = koMapping;

export interface Note {
    id: KnockoutObservable<number>;
    content: KnockoutObservable<string>;
    modified: KnockoutObservable<Date>;
}

export interface ISortOrder {
    prop: string; 
    desc?: boolean; 
}

export interface IQuery {
    skip?: number;
    top?: number;
    orderBy?: ISortOrder
}

export interface INoteRepository {
    createNew(): Note;
    get(query?: IQuery): Promise<Note[]>;
    getById(id: number): Promise<Note>;
    add(item: Note): Promise<void>;
    update(item: Note): Promise<void>;
    deleteById(id: number): Promise<boolean>;
}

@singleton
export class NoteRepository implements INoteRepository {
    constructor() {
        this.tryLoadFromBackingStore();
    }
    
    private static backingStoreKey = "NoteRepositoryStore"
    
    private static store: Note[] = [
        { 
            id: ko.observable(1),
            modified: ko.observable(new Date(2016, 4, 17, 12, 2, 57)),
            content: ko.observable(
`This is a sample note.
This is some sample text.
`)
        }
    ];
    
    private tryLoadFromBackingStore() {
        let backedStore = localStorage[NoteRepository.backingStoreKey] 
            ? ko.mapping.fromJSON(localStorage[NoteRepository.backingStoreKey]) 
            : null;
        
        NoteRepository.store = backedStore ? backedStore : NoteRepository.store;
    }
    
    private dumpToBackingStore() {
        localStorage[NoteRepository.backingStoreKey] = ko.mapping.toJSON(NoteRepository.store);
    }
    
    private clone(item: Note): Note {
        return { 
            id: ko.observable(item.id()), 
            content: ko.observable(item.content()),
            modified: ko.observable(item.modified())
        } 
    }
    
    createNew(): Note {
        return {
            id: ko.observable(-1),
            content: ko.observable<string>(),
            modified: ko.observable<Date>(new Date())
        };
    }
    
    get(query: IQuery = {}): Promise<Note[]> {
        query.skip = query.skip || 0;
        function filter (item: Note, index: number, array: Note[]): boolean {
            let result = true;
            if(index < query.skip) {
                result = false;
            }
            if(query.top && query.top + query.skip < index) {
                result = false;
            }
            return result;
        }
        
        function sort (itemA: Note, itemB: Note): number {
            let result = 0;
            if (query.orderBy) {
                result = ko.unwrap(itemA[query.orderBy.prop]) < ko.unwrap(itemB[query.orderBy.prop]) 
                    ? (query.orderBy.desc ? 1 : -1) 
                    : (query.orderBy.desc ? -1 : 1);
            }
            return result;
        }
        return new Promise((resolve, reject) => {
            resolve(NoteRepository.store.sort(sort).filter(filter).map(this.clone));
        });
        
    }
    
    getById(id: number): Promise<Note> {
        return new Promise((resolve, reject) => {
            let matches = NoteRepository.store.filter(i => i.id() === id).map(this.clone);
            resolve(!matches.length ? undefined : matches[0]);
        });
    }
    
    deleteById(id: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let findResult = this.findById(id);
            if(findResult.index > -1) {
                NoteRepository.store.splice(findResult.index, 1);
                this.dumpToBackingStore();
            }
            resolve(findResult.index > -1);
        });
    }
    
    update(item: Note): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let findResult = this.findById(item.id());
            item.modified(new Date());
            NoteRepository.store[findResult.index] = this.clone(item); 
            this.dumpToBackingStore();
            resolve();
        });
    }
    
    add(item: Note): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            item.id(this.newId());
            item.modified(new Date());
            NoteRepository.store.push(this.clone(item));
            this.dumpToBackingStore();
            resolve();
        });
    }
    
    private newId(): number {
        let result: number = NoteRepository.store.reduce((prev: number, curr: Note) => curr.id() > prev ? curr.id() : prev, 0);
        return result + 1;
    }


    private findById(id: number): { item: Note; index: number } {
            let result = {
                index: -1,
                item: undefined
            };
            for(let i = 0; i < NoteRepository.store.length && result.index === -1; i++) {
                let item = NoteRepository.store[i];
                if (item.id() == id) {
                    result.index = i;
                    result.item = item;
                }                
            }
            return result;
    }
    
}