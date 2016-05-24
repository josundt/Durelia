import {singleton} from "app-framework";
import json from "adra-jsutils-json";
import array from "adra-jsutils-array";
import obj from "adra-jsutils-obj";

export interface Note {
    id: number;
    content: string;
    modified: Date;
}

export interface ISortOrder {
    prop: string; 
    desc?: boolean; 
}

export interface IQuery {
    skip?: number;
    top?: number;
    orderBy?: ISortOrder;
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
    
    private static backingStoreKey: string = "NoteRepositoryStore";
    
    private static store: Note[] = [
        { 
            id: 1,
            modified: new Date(2016, 4, 17, 12, 2, 57),
            content: `
This is a sample note.
This is some sample text.
`.trim()
        }
    ];
    
    private tryLoadFromBackingStore() {
        let backedStore = localStorage[NoteRepository.backingStoreKey] 
            ? json.parse<Note[]>(localStorage[NoteRepository.backingStoreKey]) 
            : null;
        
        NoteRepository.store = backedStore ? backedStore : NoteRepository.store;
    }
    
    private dumpToBackingStore() {
        localStorage[NoteRepository.backingStoreKey] = json.stringify(NoteRepository.store);
    }
    
    private clone(item: Note): Note {
        let result = obj.extend({}, item);
        return result; 
    }
    
    createNew(): Note {
        return {
            id: -1,
            content: null,
            modified: new Date()
        };
    }
    
    get(query: IQuery = {}): Promise<Note[]> {
        query.skip = query.skip || 0;
        function filter (item: Note, index: number, array: Note[]): boolean {
            let result = true;
            if (index < query.skip) {
                result = false;
            }
            if (query.top && query.top + query.skip < index) {
                result = false;
            }
            return result;
        }
        
        function sort (itemA: Note, itemB: Note): number {
            let result = 0;
            if (query.orderBy) {
                result = itemA[query.orderBy.prop] < itemB[query.orderBy.prop] 
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
            let matches = NoteRepository.store.filter(n => n.id === id).map(this.clone);
            resolve(!matches.length ? undefined : matches[0]);
        });
    }
    
    deleteById(id: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let found = array.removeFirst(NoteRepository.store, n => n.id === id);
            if (found) {
                this.dumpToBackingStore();
            }
            resolve(found);
        });
    }
    
    update(note: Note): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let index = array.indexOf(NoteRepository.store, n => n.id === note.id);
            note.modified = new Date();
            NoteRepository.store[index] = this.clone(note); 
            this.dumpToBackingStore();
            resolve();
        });
    }
    
    add(note: Note): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            note.id = this.newId();
            note.modified = new Date();
            NoteRepository.store.push(this.clone(note));
            this.dumpToBackingStore();
            resolve();
        });
    }
    
    private newId(): number {
        let result: number = NoteRepository.store.reduce((prev: number, curr: Note) => curr.id > prev ? curr.id : prev, 0);
        return result + 1;
    }

}