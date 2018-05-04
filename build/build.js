"use strict";

/* jshint ignore:start */
const buildSrc = require("./build-src");
const buildSample = require("./build-sample");

buildSrc().then(() => buildSample());