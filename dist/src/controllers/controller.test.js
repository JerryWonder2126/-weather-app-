"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable node/no-unpublished-require */
/* eslint-disable node/no-unpublished-import */
const globals_1 = require("@jest/globals");
const path = require('path');
require('dotenv').config({
    path: path.resolve(process.cwd(), '.test.env'),
});
const index_1 = require("../../index");
const request = require('supertest');
(0, globals_1.describe)('Test the onecall API endpoint', () => {
    (0, globals_1.it)('should return right timezone', async () => {
        const response = await request(index_1.default).post('/api/forecast/').send({
            lat: 4.8472,
            long: 6.9746,
        });
        const data = JSON.parse(response.text);
        (0, globals_1.expect)(data.timezone).toBe('Africa/Lagos');
    });
    (0, globals_1.it)('should return a 404 error code when lat is not provided', async () => {
        const response = await request(index_1.default).post('/api/forecast/').send({
            long: 7.2334,
        });
        (0, globals_1.expect)(response.status).toEqual(404);
    });
    (0, globals_1.it)('should return a 404 error code when long is not provided', async () => {
        const response = await request(index_1.default).post('/api/forecast/').send({
            lat: 14.2334,
        });
        (0, globals_1.expect)(response.status).toEqual(404);
    });
    (0, globals_1.it)('should return a 404 error code when both lat and long is not provided', async () => {
        const response = await request(index_1.default).post('/api/forecast/');
        (0, globals_1.expect)(response.status).toEqual(404);
    });
    (0, globals_1.it)('should return proper error message when lat is not provided', async () => {
        const response = await request(index_1.default).post('/api/forecast/').send({
            long: 7.4524,
        });
        (0, globals_1.expect)(response.text).toEqual('lat and long must be defined');
    });
    (0, globals_1.it)('should return proper error message when long is not provided', async () => {
        const response = await request(index_1.default).post('/api/forecast/').send({
            lat: 13.4524,
        });
        (0, globals_1.expect)(response.text).toEqual('lat and long must be defined');
    });
    (0, globals_1.it)('should return proper error message when lat and long is not provided', async () => {
        const response = await request(index_1.default).post('/api/forecast/');
        (0, globals_1.expect)(response.text).toEqual('lat and long must be defined');
    });
});
(0, globals_1.describe)('Test the weather API endpoint', () => {
    (0, globals_1.it)('should return data for right country', async () => {
        const response = await request(index_1.default).post('/api/search/').send({
            name: 'Alaska',
        });
        const data = JSON.parse(response.text);
        (0, globals_1.expect)(data.name).toBe('Alaska');
    });
    (0, globals_1.it)('should return a 404 error code when look_up is not provided', async () => {
        const response = await request(index_1.default).post('/api/search/');
        (0, globals_1.expect)(response.status).toEqual(404);
    });
    (0, globals_1.it)('should return proper error message when look_up is not provided', async () => {
        const response = await request(index_1.default).post('/api/search/');
        (0, globals_1.expect)(response.text).toEqual('Name must be defined');
    });
});
//# sourceMappingURL=controller.test.js.map