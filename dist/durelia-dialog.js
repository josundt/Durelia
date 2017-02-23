var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "plugins/dialog", "durelia-dependency-injection"], function (require, exports, durandalDialog, durelia_dependency_injection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DialogService = (function () {
        function DialogService(container) {
            this.container = container;
        }
        DialogService.prototype.open = function (options) {
            var vm = this.container.resolve(options.viewModel);
            return durandalDialog.show(vm, options.model);
        };
        return DialogService;
    }());
    DialogService = __decorate([
        durelia_dependency_injection_1.singleton,
        durelia_dependency_injection_1.inject(durelia_dependency_injection_1.DependencyInjectionContainer)
    ], DialogService);
    exports.DialogService = DialogService;
    var DialogController = (function () {
        function DialogController() {
        }
        DialogController.prototype.ok = function (result, viewModel) {
            var dialogResult = {
                wasCancelled: false,
                output: result
            };
            return durandalDialog.close(viewModel, dialogResult);
        };
        DialogController.prototype.cancel = function (result, viewModel) {
            var dialogResult = {
                wasCancelled: true,
                output: result
            };
            return durandalDialog.close(viewModel, dialogResult);
        };
        return DialogController;
    }());
    exports.DialogController = DialogController;
});
//# sourceMappingURL=durelia-dialog.js.map