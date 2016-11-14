export const observeDecoratorKeyName: string = "__observeDecorated__";

export function computedFrom(...dependentProps: string[]): (viewmodel: any, key: string, descriptor: PropertyDescriptor) => void {
    return (viewmodel: any, key: string, descriptor: PropertyDescriptor): void => {
    };
}

export function observe(enabled: boolean = true): (viewmodel: Function) => void {
    return (viewmodel: Function): void => {
        viewmodel[observeDecoratorKeyName] = enabled;
    };
}