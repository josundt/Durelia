import { singleton, inject } from "durelia-framework";
import { JsonSerializer, ISerializer } from "./serializer";

export interface Note {
    id: number;
    content: string | null;
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
@inject(JsonSerializer)
export class NoteRepository implements INoteRepository {
    constructor(
        private serializer: ISerializer
    ) {
        this.tryLoadFromBackingStore();
    }

    private static backingStoreKey: string = "NoteRepositoryStore";

    private static store: Note[] = [
        {
            id: 1,
            modified: new Date(2016, 4, 17, 12, 2, 57),
            // tslint:disable-next-line:no-multiline-string
            content: `
This is a sample note.
This is some sample text.
`.trim()
        }
    ];

    private tryLoadFromBackingStore(): void {
        const backedStore = localStorage[NoteRepository.backingStoreKey]
            ? this.serializer.deserialize<Note[]>(localStorage[NoteRepository.backingStoreKey])
            : null;

        NoteRepository.store = backedStore ? backedStore : NoteRepository.store;
    }

    private dumpToBackingStore(): void {
        localStorage[NoteRepository.backingStoreKey] = this.serializer.serialize(NoteRepository.store);
    }

    private clone(item: Note): Note {
        return this.serializer.deserialize<Note>(this.serializer.serialize(item));
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
        function filter(item: Note, index: number, array: Note[]): boolean {
            let result = true;
            if (index < query.skip) {
                result = false;
            }
            if (query.top && query.top + query.skip < index) {
                result = false;
            }
            return result;
        }

        function sort(itemA: Note, itemB: Note): number {
            let result = 0;
            if (query.orderBy) {
                result = itemA[query.orderBy.prop] < itemB[query.orderBy.prop]
                    ? (query.orderBy.desc ? 1 : -1)
                    : (query.orderBy.desc ? -1 : 1);
            }
            return result;
        }
        return new Promise((resolve, reject) => {
            resolve(NoteRepository.store.sort(sort).filter(filter).map(this.clone.bind(this)));
        });

    }

    getById(id: number): Promise<Note | undefined> {
        return new Promise((resolve, reject) => {
            const matches: Note[] = NoteRepository.store.filter(n => n.id === id).map(this.clone.bind(this));
            resolve(!matches.length ? undefined : matches[0]);
        });
    }

    deleteById(id: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const searchResult = this.searchArray(NoteRepository.store, (n => n.id === id));
            if (searchResult.index >= 0) {
                NoteRepository.store.splice(searchResult.index);
                this.dumpToBackingStore();
            }
            resolve(searchResult.index >= 1);
        });
    }

    update(note: Note): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const index = this.searchArray(NoteRepository.store, n => n.id === note.id).index;
            if (index < 0) {
                throw new Error("Cannot update an item that does not exist.");
            }
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

    private searchArray<T>(array: T[], predicate: (item: T) => boolean, reverse?: boolean, throwOnMultiple?: boolean): { index: number, item: T | undefined } {
        const result = { index: -1, item: <T | undefined>undefined };
        for (let i = (reverse ? array.length - 1 : 0); reverse ? i >= 0 : i < array.length; reverse ? i-- : i++) {
            if (predicate(array[i])) {
                if (throwOnMultiple && result.item) {
                    throw new Error("Predicate yielded more than one result.");
                }
                result.index = i;
                result.item = array[i];
                if (!throwOnMultiple) {
                    break;
                }
            }
        }
        return result;
    }

    private newId(): number {
        const result: number = NoteRepository.store.reduce((prev: number, curr: Note) => curr.id > prev ? curr.id : prev, 0);
        return result + 1;
    }

}