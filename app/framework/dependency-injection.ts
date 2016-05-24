import {ILogger, Logger} from "app-logger";

export interface IResolvable {}

export interface IResolvableConstructor {
    new (...injectables: IResolvable[]): IResolvable;
    prototype: IResolvable;
    inject?(): Array<IResolvableConstructor>;
    __lifetime__?: "singleton" | "transient";
}

interface IDependencyTreeNode {
    classType: IResolvableConstructor;
    instance: IResolvable;
    parent: IDependencyTreeNode;
    children: IDependencyTreeNode[];
}

const lifetimePropName = "__lifetime__";

class DependencyInjectionContainer implements IDependencyInjectionContainer {
    
    constructor(
        private logger: ILogger = new Logger()
    ) {}
    
    singletonTypeRegistry: IResolvableConstructor[] = [];
    singletonInstances: IResolvable[] = [];
    
    debug: boolean = true;

    resolve<T>(classType: Function | {}): T {
        return this.resolveRecursive(classType).instance as T;
    }
    
    private isConstructorFunction(o: any): o is IResolvableConstructor {
        return !!(o && typeof o === "function" && o["prototype"]);
    }
    
    private isObjectInstance(o: any): o is Object {
        return typeof o !== "function" && Object(o) === o; //&& Object.getPrototypeOf(o) === Object.prototype;
    }
    
    private isLazyInjection(o: any): o is Lazy<any> {
        return this.isObjectInstance(o) && o.constructor && this.getClassName(o.constructor) ===  "Lazy";
    }
    
    private getClassName(classType: IResolvableConstructor) {
        return classType.prototype.constructor["name"];
    }

    private hasInjectionInstructions(classType: IResolvableConstructor): boolean {
        return !!(classType.inject && typeof classType.inject === "function");
    }
    
    private getInjecteeTypes(classType: IResolvableConstructor): IResolvableConstructor[] {
        return this.hasInjectionInstructions(classType)
            ? classType.inject()
            : [];
    }

    private isSingleton(classType: IResolvableConstructor): boolean {
        return !classType.__lifetime__ || classType.__lifetime__ === "singleton";
    }
    
    private getDependencyPath(node: IDependencyTreeNode): string {
        let parts: string[] = [];
        while (node) {
            parts.unshift(this.getClassName(node.classType));
            node = node.parent;
        }
        return parts.join("/");
    }

    private resolveRecursive(classOrObject: IResolvableConstructor | {}, parent: IDependencyTreeNode = null): IDependencyTreeNode {
        if (this.isLazyInjection(classOrObject)) {
            let lazy = classOrObject;
            let depNode: IDependencyTreeNode = {
                parent: parent,
                classType: lazy.constructor as IResolvableConstructor,
                instance: lazy["resolver"],
                children: <IDependencyTreeNode[]>[]
            };
            return depNode;
        } 
        else if (this.isConstructorFunction(classOrObject)) {
            let classType = classOrObject;
            
            let injectees: IResolvableConstructor[] = this.getInjecteeTypes(classType);
            let ctorArgsCount: number = classType.length;
            let className: string = this.getClassName(classType);
            let depNode: IDependencyTreeNode = {
                parent: parent,
                classType: classType,
                instance: <IResolvable>null,
                children: <IDependencyTreeNode[]>[]
            };
            let dependencyPath = this.getDependencyPath(depNode);

            if (injectees.length !== ctorArgsCount) {
                let msg = `DependecyResolver: ${dependencyPath} FAILED. Injection argument vs constructor parameters count mismatch.`;
                this.logger.error(msg);
                throw new Error(msg);            
            }
            
            for (let injectee of injectees) {
                let childDep = this.resolveRecursive(injectee, depNode);
                depNode.children.push(childDep);
            }

            let ctorInjectionArgs = depNode.children.map(c => c.instance);
            if (this.isSingleton(classType)) {
                let idx = this.singletonTypeRegistry.indexOf(classType);
                if (idx >= 0) {
                    depNode.instance = this.singletonInstances[idx];
                    this.logger.debug(`DependecyResolver: ${dependencyPath} (singleton) resolved: Returned existing instance.`);
                } 
                else {
                    depNode.instance = new classType(...ctorInjectionArgs);
                    this.singletonTypeRegistry.push(classType);
                    this.singletonInstances.push(depNode.instance);
                    this.logger.debug(`DependecyResolver: ${dependencyPath} (singleton) resolved: Created new instance.`);
                }
            } 
            else {
                depNode.instance = new classType(...ctorInjectionArgs);            
                this.logger.debug(`DependecyResolver: ${dependencyPath} (transient) resolved: Created new instance.`);
            }
            
            return depNode;
            
        } 
        else if (this.isObjectInstance(classOrObject)) {
            let object = classOrObject;
            
            let depNode: IDependencyTreeNode = {
                classType: object.constructor ? object.constructor as IResolvableConstructor : Object,
                instance: object,
                parent: parent,
                children: []
            };

            let dependencyPath = this.getDependencyPath(depNode);
            this.logger.debug(`DependecyResolver: ${dependencyPath} resolved. Object instance injected, not a class. Returning instance.`, object);
            
            return depNode;
        } 
        else {
            let neitnerClassNorObject = classOrObject;
            
            let depNode: IDependencyTreeNode = {
                classType: neitnerClassNorObject.constructor ? neitnerClassNorObject.constructor as IResolvableConstructor : Object,
                instance: neitnerClassNorObject,
                parent: parent,
                children: []
            };
            let dependencyPath = this.getDependencyPath(depNode);
            let msg = `DependecyResolver: ${dependencyPath} FAILED. Not an object or constructor function.`;
            this.logger.error(msg, neitnerClassNorObject);
            throw new Error(msg);
        }

    }
}

export let container: IDependencyInjectionContainer = new DependencyInjectionContainer();

export function inject(...args: Array<Object | Function>) {
    return function (classType: Function) {
        classType["inject"] = () => args;
    };
}

export function singleton(classType: Function) {
    (classType as IResolvableConstructor).__lifetime__ = "singleton";
}

export function transient(classType: Function) {
    (classType as IResolvableConstructor).__lifetime__ = "transient";
}

export interface IDependencyInjectionContainer {
    resolve<T>(classOrObject: Function | Object): T;
}

export class Lazy<T> {
    constructor(classOrObject: IResolvableConstructor | {}, cont: IDependencyInjectionContainer) {
        this.resolver = () => cont.resolve<T>(classOrObject);
    }
    static of(classOrObject: IResolvableConstructor | {}) {
        return new Lazy(classOrObject, container);
    }
    private resolver: () => T;
    
}

