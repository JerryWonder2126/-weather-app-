"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
// eslint-disable-next-line node/no-unpublished-import
const dotenv = require("dotenv");
const controller_1 = require("./controllers/controller");
const path = require("path");
dotenv.config();
const app = express();
app.use(bodyParser.json());
let staticFolder = '../assets';
if (process.env['PRODUCTION_MODE']) {
    staticFolder = '../../assets';
}
app.use(express.static(path.join(__dirname, staticFolder)));
app.set('view engine', 'ejs');
app.use('/', controller_1.router);
const port = process.env.port || 8000;
app.listen(port, () => {
    console.log(`App started. Listening on port ${port}`);
});
//# sourceMappingURL=index.js.map