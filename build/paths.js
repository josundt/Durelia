"use strict";

/* jshint ignore:start */
let path = require("path");

let paths = {
    src: "../src",
    dist: "../dist",
    sample: "../sample",
    sampleTypings: "../sample/typings/durelia"
};



let resolvedPaths = {}; 
Object.keys(paths).forEach(key => resolvedPaths[key] = path.resolve(__dirname, paths[key]));
module.exports = resolvedPaths;
