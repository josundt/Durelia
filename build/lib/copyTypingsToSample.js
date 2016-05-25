/* jshint ignore:start */
let fs = require("fs");
let path = require("path");
let rimraf = require("rimraf");

function copyFile(source, target) {
    return new Promise((resolve, reject) => {
        var rd = fs.createReadStream(source);
        rd.on('error', reject);
        var wr = fs.createWriteStream(target);
        wr.on('error', reject);
        wr.on('finish', resolve);
        rd.pipe(wr);
    });
}

function copyTypingsToSample(distPath, sampleTypingsPath) {
    console.log(" - Copying build to sample directory STARTED.");
    let destFolder = path.resolve(sampleTypingsPath, "durelia");
    if (!fs.existsSync(sampleTypingsPath)) {
        fs.mkdirSync(sampleTypingsPath);
    } else {
        for (let file of fs.readdirSync(sampleTypingsPath)) {
            fs.unlinkSync(path.resolve(sampleTypingsPath, file));
        }
    }
    return Promise.all(
        fs.readdirSync(distPath)
            .filter(file => file.endsWith(".d.ts"))
            .map(file => 
            copyFile(
                path.resolve(distPath, file), 
                path.resolve(sampleTypingsPath, file)
            )
        )
    ).then(() => console.log(" - Copying build to sample directory DONE."));
}

module.exports = copyTypingsToSample;