/* jshint ignore:start */
let paths = require("./paths");
let tsc = require("./lib/tsc");
let fixDeclarations = require("./lib/fixDeclarations");

function buildSrc() {
    return tsc(paths.src).then(() => fixDeclarations(paths.dist));
}

module.exports = buildSrc;