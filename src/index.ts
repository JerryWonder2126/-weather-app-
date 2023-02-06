import * as express from 'express';
import * as bodyParser from 'body-parser';
// eslint-disable-next-line node/no-unpublished-import
import {router} from './controllers/controller';
const path = require('path');

const app = express();

app.use(bodyParser.json());

let BASE_DIR = path.join(__dirname, '../');

if (process.env['PRODUCTION_MODE']) {
  BASE_DIR = path.join(__dirname, '../../');
}

app.use(express.static(path.join(BASE_DIR, '/public')));

app.set('view engine', 'ejs');

app.use('/', router);

export default app;
