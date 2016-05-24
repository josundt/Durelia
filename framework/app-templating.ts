export function useView(viewPath: string) {
    return function (classType: Function) {
        classType.prototype.getView = () => viewPath;
    };
}

