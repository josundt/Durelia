/* jshint ignore:start */
let exec = require("child_process").exec;
let ChildProcess = require("child_process").ChildProcess;
let path = require("path");

function typescriptCompile(srcDir) {
    let tscPath = path.resolve("./node_modules/.bin/tsc"); 
    return new Promise((resolve, reject) => {
        console.log(` - Typescript compilation STARTED (${srcDir}).`)
        let childProcess = exec(tscPath, { cwd: srcDir }, (error, stdout, stderr) => {
            if (error) {
                console.error("TypeScript build failed.");
                reject();
            }
            console.log(` - Typescript compilation DONE (${srcDir}).`);
            resolve();
        });
        
        childProcess.stdout.pipe(process.stdout);
        childProcess.stderr.pipe(process.stderr);
        
    });
}

module.exports = typescriptCompile;