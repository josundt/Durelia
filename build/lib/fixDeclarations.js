/* jshint ignore:start */
let fs = require("fs");
let path = require("path");

function fixDeclarations(distPath) {
    return new Promise((resolve, reject) => {
        console.log(" - Fix of declaration files STARTED.")
        for (let fileName of fs.readdirSync(distPath)) {
            if (fileName.endsWith(".d.ts")) {
                let moduleName = fileName.substring(0, fileName.length - 5);
                let filePath = path.resolve(distPath, fileName);
                let fileContent = fs.readFileSync(filePath).toString();
                let lineFeed = fileContent.indexOf("\r\n") >= 0 ? "\r\n" : "\n";
                let indent = "    ";
                let fileLines = fileContent.split(/\r\n|\r/).map(l => indent + l.replace("declare ", ""));
                fileLines.unshift(`declare module "${moduleName}" {`);
                fileLines.push("}");            
                fs.writeFileSync(filePath, fileLines.join(lineFeed));
            }
        }
        console.log(" - Fix of declaration files DONE.");
        resolve();
    });
}

module.exports = fixDeclarations;