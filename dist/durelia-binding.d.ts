export declare const observeDecoratorKeyName: string;
export declare function computedFrom(...dependentProps: string[]): (viewmodel: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function observe(enabled?: boolean): (viewmodel: Function) => void;
