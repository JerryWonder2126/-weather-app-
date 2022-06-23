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
        const API_KEY = process.env.OPEN_WEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=hourly,minutely&appid=${API_KEY}`;
        const the_response = await axios_1.default.get(url);
        res.json(the_response.data);
    }
    catch (err) {
        res.status(500).send("Couldn't connect to OpenWeatherAPI");
    }
    res.end();
});
router.post('/api/search/', async (req, res) => {
    try {
        const look_up = req.body['name'];
        const API_KEY = process.env.OPEN_WEATHER_API_KEY;
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${look_up}&appid=${API_KEY}`;
        const the_response = await axios_1.default.get(url);
        res.json(the_response.data);
    }
    catch (err) {
        if (err.response) {
            res.status(err.response.data.cod).send(err.response.data.message);
        }
        else {
            res.sendStatus(404);
        }
    }
    res.end();
});
router.get('/connect/', (req, res) => {
    const socialLinks = {
        facebook: 'https://facebook.com',
        whatsapp: 'https://whatsapp.com',
        linkedIn: 'https://linkedin.com',
        twitter: 'https://twitter.com',
    };
    const network = req.query['network'];
    try {
        if (!(network in socialLinks)) {
            throw new Error('Invalid request.');
        }
        const link = socialLinks[network];
        // res.sendStatus(200);
        res.redirect(link);
    }
    catch (err) {
        res.sendStatus(403);
    }
    res.end();
});
//# sourceMappingURL=controller.js.map