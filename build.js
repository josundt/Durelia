"use strict";

/* jshint ignore:start */
const buildSrc = require("./build/build-src");
const buildSample = require("./build/build-sample");

buildSrc().then(() => buildSample());