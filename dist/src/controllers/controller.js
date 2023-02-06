"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express = require("express");
const axios_1 = require("axios");
const router = express.Router();
exports.router = router;
router.get('/', (req, res) => {
    res.render('index');
});
router.post('/api/forecast/', async (req, res) => {
    try {
        const lat = req.body['lat'];
        const long = req.body['long'];
        if (!lat || !long)
            throw Error('lat and long must be defined');
        const API_KEY = process.env.OPEN_WEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`;
        const the_response = await axios_1.default.get(url);
        res.json(the_response.data);
    }
    catch (err) {
        if (err.response) {
            res.status(500).send("Couldn't connect to OpenWeatherAPI");
        }
        else {
            res.status(404).send(err.message);
        }
    }
    res.end();
});
router.post('/api/search/', async (req, res) => {
    try {
        const look_up = req.body['name'];
        const API_KEY = process.env.OPEN_WEATHER_API_KEY;
        if (!look_up)
            throw Error('Name must be defined');
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${look_up}&units=metric&appid=${API_KEY}`;
        const the_response = await axios_1.default.get(url);
        res.json(the_response.data);
    }
    catch (err) {
        if (err.response) {
            res.status(err.response.data.cod).send(err.response.data.message);
        }
        else {
            res.status(404).send(err.message);
        }
    }
    res.end();
});
router.get('/connect/', (req, res) => {
    const socialLinks = {
        github: 'https://github.com/JerryWonder2126',
        whatsapp: 'https://wa.link/b8t54g',
        linkedIn: 'https://linkedin.com/in/devwonder',
        twitter: 'https://twitter.com/JosephJSJeremi1',
    };
    const network = req.query['network'];
    try {
        if (!(network in socialLinks)) {
            throw new Error('Invalid request.');
        }
        const link = socialLinks[network];
        res.redirect(link);
    }
    catch (err) {
        res.sendStatus(403);
    }
    res.end();
});
//# sourceMappingURL=controller.js.map