"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const controller_1 = require("./src/controllers/controller");
const path = require('path');
const app = express();
app.use(bodyParser.json());
let BASE_DIR = path.resolve(__dirname);
if (process.env['NODE_ENV'] === 'prod') {
    BASE_DIR = path.join(__dirname, '../');
}
app.use(express.static(path.join(BASE_DIR, '/public')));
app.set('view engine', 'ejs');
app.use('/', controller_1.router);
exports.default = app;
//# sourceMappingURL=index.js.map