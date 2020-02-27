"use strict";
exports.__esModule = true;
var express_1 = require("express");
var app = express_1["default"]();
var handleListening = function () { return console.log('listening server -> 4000'); };
app.listen(4000, handleListening);
