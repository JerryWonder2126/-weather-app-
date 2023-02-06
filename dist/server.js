"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable node/no-unpublished-require */
const index_1 = require("./index");
const path = require('path');
const envFilePaths = ['.test.env', '.prod.env', '.dev.env'];
const environment = process.env['NODE_ENV'] || '';
require('dotenv').config({
    path: path.resolve(process.cwd(), envFilePaths.find(value => value.includes(environment))),
});
const port = process.env['PORT'];
index_1.default.listen(port, () => {
    console.log(`App started. Listening on port ${port}`);
});
//# sourceMappingURL=server.js.map