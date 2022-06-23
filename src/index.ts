import * as express from 'express';
import * as bodyParser from 'body-parser';
import {router} from './controllers/controller';

import path = require('path');

const app = express();

app.use(bodyParser.json());

let staticFolder = '../assets';
if (process.env['PRODUCTION_MODE']) {
  staticFolder = '../../assets';
}

app.use(express.static(path.join(__dirname, staticFolder)));

app.set('view engine', 'ejs');

app.use('/', router);

app.listen(process.env.port || 8000, () => {
  console.log('App started. Listening on port 8000');
});
