/* jshint ignore:start */
let buildSrc = require("./build/build-src");
let buildSample = require("./build/build-sample");

buildSrc().then(() => buildSample());