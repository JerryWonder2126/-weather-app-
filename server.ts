/* eslint-disable node/no-unpublished-require */
import app from './index';
const path = require('path');

const envFilePaths = ['.test.env', '.prod.env', '.dev.env'];
const environment = process.env['NODE_ENV'] || '';
require('dotenv').config({
  path: path.resolve(
    process.cwd(),
    envFilePaths.find(value => value.includes(environment))
  ),
});
const port = process.env['PORT'];

app.listen(port, () => {
  console.log(`App started. Listening on port ${port}`);
});
