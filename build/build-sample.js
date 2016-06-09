"use strict";

/* jshint ignore:start */
let paths = require("./paths");
let copyTypingsToSample = require("./lib/copyTypingsToSample");
let tsc = require("./lib/tsc");

function buildSample() {
    return copyTypingsToSample(paths.dist, paths.sampleTypings).then(() => tsc(paths.sample));
}

module.exports = buildSample;
