import * as durandalObservable from "plugins/observable";

export const observeDecoratorKeyName: string = "__observeDecorated__";
const appliedComputedsKeyName = "__observeApplied__";

export function computedFrom(...dependentProps: string[]) {
    return function(viewmodel: any, key: string, descriptor: PropertyDescriptor) {
        
        let origCtor = viewmodel.constructor;
        
        viewmodel.constructor = function(...args: any[]) {
            let target = this;
            let computedDef: KnockoutComputedDefine<any> = { 
                read: descriptor.get, 
                write: descriptor.set || function(v: any) {}, 
                owner: target 
            };
        
            delete target[key];
            target[key] = durandalObservable.defineProperty<any>(target, key, computedDef);
            
            origCtor(...args);                
        };
    };
}

export function observe(enabled: boolean = true) {
    return function(viewmodel: Function) {
        viewmodel[observeDecoratorKeyName] = true;
    };
}