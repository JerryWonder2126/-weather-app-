import * as express from 'express';
import {Request, Response} from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.render('index');
});

router.post('/api/forecast/', async (req: Request, res: Response) => {
  try {
    const lat = req.body['lat'];
    const long = req.body['long'];
    const API_KEY = process.env.OPEN_WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=hourly,minutely&appid=${API_KEY}`;
    const the_response = await axios.get(url);
    console.log(the_response.data);
    res.json(the_response.data);
  } catch (err: any) {
    console.log(err);
    res.status(500).send("Couldn't connect to OpenWeatherAPI");
  }
  res.end();
});

router.post('/api/search/', async (req: Request, res: Response) => {
  try {
    const look_up = req.body['name'];
    const API_KEY = process.env.OPEN_WEATHER_API_KEY;
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${look_up}&appid=${API_KEY}`;
    const the_response = await axios.get(url);
    console.log(the_response.data);
    res.json(the_response.data);
  } catch (err: any) {
    console.log(err);
    res.status(500).send("Couldn't connect to OpenWeatherAPI");
  }
  res.end();
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

export {router};
