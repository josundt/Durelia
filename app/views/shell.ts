import * as durandalRouter from "plugins/router";
import {BaseViewModel, observe} from "base/viewmodel";
import {singleton, inject, useView} from "dependency-injection";

@observe
@useView("views/shell.html")
@singleton
@inject(durandalRouter)
export default class Shell extends BaseViewModel<void> {
    
    constructor(
        public router: DurandalRootRouter
    ) {
        super();
    }
    
    heading: string;

    configureRouter(): Promise<any> {
        
        this.router.map([
            { route: "", title: "Home", moduleId: "views/home/home", nav: true },
            { route: "notes", title: "Notes", moduleId: "views/notes/notelist", nav: true },
            { route: "notes/:id", title: "Note detail", moduleId: "views/notes/notedetail", nav: false }
        ]).buildNavigationModel();
        
        return this.router.activate() as any;
    }

    activate(): Promise<any> {
        this.heading = "Shell";
        return this.configureRouter();
    }
}
