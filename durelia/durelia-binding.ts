import * as durandalObservable from "plugins/observable";

export const observeDecoratorKeyName = "__observeDecorated__";

export function computedFrom(...dependentProps: string[]) {
    return function(viewmodel: any, key: string, descriptor: PropertyDescriptor) {
        let computedDef: KnockoutComputedDefine<any> = { read: descriptor.get, write: descriptor.set, owner: viewmodel.constructor.prototype };
        viewmodel.constructor.prototype["key"] = durandalObservable.defineProperty<any>(viewmodel.constructor.prototype, key, computedDef);
    };
}

export function observe(enabled: boolean = true) {
    return function(viewmodel: Function) {
        viewmodel[observeDecoratorKeyName] = true;
    };
}