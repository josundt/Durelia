export const computedRegistryKeyName: string = "__computeds__";

export function useView(viewPath: string) {
    return function (classType: Function) {
        classType.prototype.getView = () => viewPath;
    };
}

export function computedFrom(...dependentProps: string[]) {
    return function(viewmodel: any, key: string, descriptor: PropertyDescriptor) {
        viewmodel[computedRegistryKeyName] = viewmodel[computedRegistryKeyName] || {};
        let tempMap: { [key: string]: KnockoutComputedDefine<any> } = viewmodel[computedRegistryKeyName];
        tempMap[key] = { read: descriptor.get, write: descriptor.set, owner: undefined};
    };
}

export function observe(enabled: boolean = true) {
    return function(viewmodel: Function) {
        viewmodel["prototype"].binding = function() {
            return { applyBindings: true, skipConversion: !enabled };
        };
    };
}