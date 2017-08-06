declare module "durelia-binding" {
    export const observeDecoratorKeyName: string;
    export function computedFrom(...dependentProps: string[]): (viewmodel: any, key: string, descriptor: PropertyDescriptor) => void;
    export function observe(enabled?: boolean): (viewmodel: Function) => void;
    
}