import * as durandalObservable from "plugins/observable";

export const observeDecoratorKeyName: string = "__observeDecorated__";
const appliedComputedsKeyName = "__observeApplied__";

export function computedFrom(...dependentProps: string[]) {
    return function(viewmodel: any, key: string, descriptor: PropertyDescriptor) {
    };
}

export function observe(enabled: boolean = true) {
    return function(viewmodel: Function) {
        viewmodel[observeDecoratorKeyName] = enabled;
    };
}