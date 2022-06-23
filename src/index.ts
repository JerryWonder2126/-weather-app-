import * as express from 'express';
import * as bodyParser from 'body-parser';
// eslint-disable-next-line node/no-unpublished-import
import * as dotenv from 'dotenv';
import {router} from './controllers/controller';

import path = require('path');

dotenv.config();

const app = express();

app.use(bodyParser.json());

let staticFolder = '../assets';
if (process.env['PRODUCTION_MODE']) {
  staticFolder = '../../assets';
}

app.use(express.static(path.join(__dirname, staticFolder)));

app.set('view engine', 'ejs');

app.use('/', router);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App started. Listening on port ${port}`);
});
