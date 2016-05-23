import * as ko from "knockout";
import {IDialogHelper} from "dialoghelper";

export interface IViewModel<TActivationOptions> {
    canActivate?(): Promise<boolean>;
    activate(options?: TActivationOptions): Promise<any>;
    canDeactivate?(): Promise<boolean>;
    deactivate(): Promise<any>;
}

export interface IModalViewModel<TActivationOptions, TDialogResult> extends IViewModel<TActivationOptions> {}

export abstract class BaseViewModel<TActivationOptions> implements IViewModel<TActivationOptions> {
    
    canActivate(): Promise<boolean> {
        return Promise.resolve(true);
    }

    abstract activate(options: TActivationOptions): Promise<any>;
    
    canDeactivate(): Promise<boolean> {
        return Promise.resolve(true);
    }

    deactivate(): Promise<any> {
        this._disposables.forEach(d => d.dispose());
        return Promise.resolve();
    }
    
    private _disposables: IDisposable[] = [];
    
    protected observable<T>(value?: T): KnockoutObservable<T> {
        return ko.observable<T>(value);
    }

    protected observableArray<T>(value?: T[]): KnockoutObservableArray<T> {
        return ko.observableArray<T>(value);
    }
    
    protected computed<T>(getterFn:() => T, setterFn?:(value: T) => void): KnockoutComputed<T> {
        let computed = setterFn 
            ? ko.computed<T>({ read: getterFn, write: setterFn, owner: this })
            : ko.computed<T>(getterFn, this);
            
        this._disposables.push(computed);
        return computed;
    }
    
    protected createSubscription<T>(observable: KnockoutObservable<T>, handlerFn: (value: T) => void) {
        this._disposables.push(observable.subscribe(handlerFn, this));
    }
}

export abstract class BaseModalViewModel<TActivationOptions, TDialogResult> 
    extends BaseViewModel<TActivationOptions> 
    implements IModalViewModel<TActivationOptions, TDialogResult> 
{
    constructor(
        private dialogHelper: IDialogHelper
    ) {
        super();
    }
    
    protected _closeDialog(result: TDialogResult): void {
        this.dialogHelper.closeModal(this, result);
    }
}