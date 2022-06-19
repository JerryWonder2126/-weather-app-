import * as express from 'express';
import {Request, Response} from 'express';
import * as bodyParser from 'body-parser';
// import * as dotenv from 'dotenv';
import axios from 'axios';
import path = require('path');
const router = express.Router();

const app = express();

// dotenv.config();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/assets')));

app.set('view engine', 'ejs');

router.get('/', (req: Request, res: Response) => {
  res.render('index');
});

router.post('/api/data/', async (req: Request, res: Response) => {
  try {
    const lat = req.body['lat'];
    const long = req.body['long'];
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=hourly,minutely&appid=${process.env.OPEN_WEATHER_API_KEY}`;
    const the_response = await axios.get(url);
    res.json(the_response.data);
  } catch (err: any) {
    console.log(err);
  }
});

app.use('/', router);

app.listen(process.env.port || 8000, () => {
  console.log('App started. Listening on port 8000');
});
// const retrieve_data = async function (url: string, lat?: number, lon?: number) {
//   //retrieves data from one call API and returns the response
//   /*One call API format
//       https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&
//       exclude={part}&appid={YOUR API KEY}*/
//   if (!url.length && lat && lon) {
//     url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${process.env.OPEN_WEATHER_API_KEY}`;
//   }
//   const the_response = await fetch(url);
//   return the_response;
// };
