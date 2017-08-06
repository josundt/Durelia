declare module "durelia-templating" {
    export function useView(viewPath: string): (classType: Function) => void;
    
}