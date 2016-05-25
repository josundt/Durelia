import * as durandalRouter from "plugins/router";
import {IViewModel} from "durelia-viewmodel";
import {singleton, inject, observe, useView} from "durelia-framework";

@observe(true)
@useView("views/shell.html")
@singleton
@inject(durandalRouter)
export default class Shell implements IViewModel<void> {
    
    constructor(
        public router: DurandalRootRouter
    ) {}
    
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
