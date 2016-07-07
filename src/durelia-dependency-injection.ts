import {ILogger, Logger} from "durelia-logger";
import {Durelia, durelia} from "durelia-framework";

export type IInjectable = IResolvableConstructor | {};

export interface IResolvedInstance {}

export interface IResolvableConstructor {
    new (...injectables: IInjectable[]): IResolvedInstance;
    prototype: IResolvedInstance;
    inject?(): Array<IInjectable>;
    /** @internal */
    __lifetime__?: "singleton" | "transient";
}

interface IDependencyTreeNode {
    classType: IResolvableConstructor;
    instance: IResolvedInstance;
    parent: IDependencyTreeNode;
    children: IDependencyTreeNode[];
}

export interface IDependencyInjectionContainer {
    resolve<T>(injectable: IInjectable): T;
    registerInstance(classType: IResolvableConstructor, instance: IResolvedInstance);
}

const lifetimePropName = "__lifetime__";
const isLazyInjectionPropName = "__isLazyInjection__";

/** @internal */
@inject(Logger)
@singleton
export class DependencyInjectionContainer implements IDependencyInjectionContainer {
    
    constructor(
        /** @internal */
        private logger: ILogger = new Logger()
    ) {}
    
    singletonTypeRegistry: IResolvableConstructor[] = [];
    singletonInstances: IResolvedInstance[] = [];
    
    debug: boolean = true;

    resolve<T>(injectable: IInjectable): T {
        return this.resolveRecursive(injectable).instance as T;
    }
    
    /** @internal */
    registerInstance(classType: IResolvableConstructor, instance: IResolvedInstance) {
        let errMsg = "Cannor register instance:";
        if (!instance) {
            throw new Error(`${errMsg} Instance is null or undefined.`);
        } else if (!classType) {
            throw new Error(`${errMsg} Type is is null or undefined.`);
        } else if (!instance.constructor || !this.isConstructorFunction(instance.constructor)) {
            throw new Error(`${errMsg} Instance is not a class instance.`);
        } else if (!this.isConstructorFunction(classType)) {
            throw new Error(`${errMsg} Type is invalid (not a class/constructor function).`);
        } else if (classType !== instance.constructor) {
            throw new Error(`${errMsg} Instance is not of the type specified.`);
        } else if (this.singletonTypeRegistry.indexOf(classType) >= 0) {
            throw new Error(`The type ${classType} is already a registered singleton.`);
        }

        this.singletonTypeRegistry.push(classType);
        this.singletonInstances.push(instance);
    }

    private isConstructorFunction(o: any): o is IResolvableConstructor {
        return !!(o && typeof o === "function" && o["prototype"]);
    }
    
    private isObjectInstance(o: any): o is Object {
        return typeof o !== "function" && Object(o) === o; //&& Object.getPrototypeOf(o) === Object.prototype;
    }
    
    private isLazyInjection(o: any): o is Lazy<any> {
        return this.isObjectInstance(o) && o.constructor && o.constructor[isLazyInjectionPropName];
    }
    
    private getClassName(classType: IResolvableConstructor): string {
        let result: string;
        result = classType.prototype.constructor["name"];
        if (!result) {
            let regExp = new RegExp("^\s*function ([^\\(]+)\\s*\\(", "m");
            let matches = regExp.exec(classType.prototype.constructor.toString());
            if (matches.length === 2) {
                result = matches[1];
            }
        }
        if (!result) {
            throw new Error("Unable to resolve class name");
        }
        return result;
    }

    private hasInjectionInstructions(classType: IResolvableConstructor): boolean {
        return !!(classType.inject && typeof classType.inject === "function");
    }
    
    private getInjectees(classType: IInjectable): IInjectable[] {
        if (this.isConstructorFunction(classType)) {
            if (this.hasInjectionInstructions(classType)) {
                return classType.inject();
            }
        }
        return [];
    }

    private hasLifetimeDecorator(classType: IResolvableConstructor) {
        return !!classType.__lifetime__;
    }

    private isTransient(classType: IResolvableConstructor) {
        return !classType.__lifetime__ || classType.__lifetime__ === "transient";
    }

    private isSingleton(classType: IResolvableConstructor): boolean {
        return classType.__lifetime__ && classType.__lifetime__ === "singleton";
    }
    
    private getDependencyPath(node: IDependencyTreeNode): string {
        let parts: string[] = [];
        while (node) {
            parts.unshift(this.getClassName(node.classType));
            node = node.parent;
        }
        return parts.join("/");
    }

    private resolveRecursive(injectable: IInjectable, parent: IDependencyTreeNode = null): IDependencyTreeNode {
        if (this.isLazyInjection(injectable)) {
            let lazy: Lazy<any> = injectable;
            let depNode: IDependencyTreeNode = {
                parent: parent,
                classType: lazy.constructor as IResolvableConstructor,
                instance: () => lazy.resolver,
                children: <IDependencyTreeNode[]>[]
            };
            return depNode;
        } 
        else if (this.isConstructorFunction(injectable)) {
            let classType = injectable;
            
            let injectees: IInjectable[] = this.getInjectees(classType);
            let ctorArgsCount: number = classType.length;
            let className: string = this.getClassName(classType);
            let depNode: IDependencyTreeNode = {
                parent: parent,
                classType: classType,
                instance: <IResolvedInstance>null,
                children: <IDependencyTreeNode[]>[]
            };
            let dependencyPath = this.getDependencyPath(depNode);

            if (injectees.length !== ctorArgsCount) {
                let msg = `Durelia DependencyResolver: ${dependencyPath} FAILED. Injection argument vs constructor parameters count mismatch.`;
                this.logger.error(msg);
                throw new Error(msg);            
            }
                        
            if (this.isSingleton(classType)) {
                let idx = this.singletonTypeRegistry.indexOf(classType);
                let lifeTimeSpec = "singleton";
                if (idx >= 0) {
                    depNode.instance = this.singletonInstances[idx];
                    this.logger.debug(`Durelia DependencyResolver: ${dependencyPath} (${lifeTimeSpec}) resolved: Returned existing instance.`);
                }
                else {
                    for (let injectee of injectees) {
                        let childDep = this.resolveRecursive(injectee, depNode);
                        depNode.children.push(childDep);
                    }
                    let ctorInjectionArgs = depNode.children.map(c => c.instance);
                    try {
                        depNode.instance = new classType(...ctorInjectionArgs);
                    } catch (error) {
                        let msg = "Durelia DependencyResolver: Unable to create new instance of class.";
                        this.logger.error(msg, classType, error);
                        throw error;
                    }
                    this.singletonTypeRegistry.push(classType);
                    this.singletonInstances.push(depNode.instance);
                    this.logger.debug(`Durelia DependencyResolver: ${dependencyPath} (${lifeTimeSpec}) resolved: Created new instance.`);
                }
            } 
            else {
                for (let injectee of injectees) {
                    let childDep = this.resolveRecursive(injectee, depNode);
                    depNode.children.push(childDep);
                }
                let ctorInjectionArgs = depNode.children.map(c => c.instance);
                try {
                    depNode.instance = new classType(...ctorInjectionArgs);
                } catch (error) {
                    let msg = "Durelia DependencyResolver: Unable to create new instance of class.";
                    this.logger.error(msg, classType, error);
                    throw error;
                }       
                let lifeTimeSpec = this.hasInjectionInstructions(classType) ? "transient" : "unspecified -> transient";
                this.logger.debug(`Durelia DependencyResolver: ${dependencyPath} (${lifeTimeSpec}) resolved: Created new instance.`);
            }
            
            return depNode;
            
        } 
        else if (this.isObjectInstance(injectable)) {
            let object = injectable;
            
            let depNode: IDependencyTreeNode = {
                classType: object.constructor ? object.constructor as IResolvableConstructor : Object,
                instance: object,
                parent: parent,
                children: []
            };

            let dependencyPath = this.getDependencyPath(depNode);
            this.logger.debug(`Durelia DependencyResolver: ${dependencyPath} resolved. Object instance injected (not a class). Returning instance.`, object);
            
            return depNode;
        } 
        else {
            let neitnerClassNorObject = injectable;
            
            let depNode: IDependencyTreeNode = {
                classType: neitnerClassNorObject.constructor ? neitnerClassNorObject.constructor as IResolvableConstructor : Object,
                instance: neitnerClassNorObject,
                parent: parent,
                children: []
            };
            let dependencyPath = this.getDependencyPath(depNode);
            let msg = `Durelia DependencyResolver: ${dependencyPath} FAILED. Not an object or constructor function.`;
            this.logger.error(msg, neitnerClassNorObject);
            throw new Error(msg);
        }
    }
}

export function inject(...args: Array<IInjectable>) {
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

/** @internal */
function isLazyInjection(classType: Function) {
    classType[isLazyInjectionPropName] = true;
}

@isLazyInjection
export class Lazy<T extends IInjectable> {
    
    /** @internal */
    constructor(private _injectable: IInjectable) {
    }

    static of<T>(injectable: IInjectable): Lazy<T> {
        return new Lazy<T>(injectable);
    }

    get resolver(): IResolvedInstance {
        return durelia.container.resolve(this._injectable);
    }
}

