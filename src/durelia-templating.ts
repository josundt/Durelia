export function useView(viewPath: string): (classType: Function) => void {
    return (classType: Function): void => {
        classType.prototype.getView = () => viewPath;
    };
}
