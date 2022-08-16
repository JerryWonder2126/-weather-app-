import * as express from 'express';
import * as bodyParser from 'body-parser';
// eslint-disable-next-line node/no-unpublished-import
import * as dotenv from 'dotenv';
import {router} from './controllers/controller';

import path = require('path');

dotenv.config();

const app = express();

app.use(bodyParser.json());

let BASE_DIR = path.join(__dirname, '../');

if (process.env['PRODUCTION_MODE']) {
  BASE_DIR = path.join(__dirname, '../../');
}

app.use(express.static(path.join(BASE_DIR, '/public')));

app.set('view engine', 'ejs');

app.use('/', router);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App started. Listening on port ${port}`);
});
