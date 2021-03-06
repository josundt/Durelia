
declare module "bluebird" {
    let promise: PromiseConstructorLike;
    export = promise;
}
declare module "q" {
    let Q: { Promise: PromiseConstructorLike; };
    export = Q;
}

// Extending DurandalRouteConfiguration object
interface DurandalRouteConfiguration {
    name: string;
}