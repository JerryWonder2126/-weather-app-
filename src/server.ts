/* eslint-disable node/no-unpublished-require */
import app from './index';
const path = require('path');

require('dotenv').config({
  path: path.resolve(
    process.cwd(),
    process.env['NODE_ENV'] === 'test' ? '.test.env' : '.local.env'
  ),
});
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App started. Listening on port ${port}`);
});
