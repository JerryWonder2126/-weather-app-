/* eslint-disable node/no-unpublished-require */
/* eslint-disable node/no-unpublished-import */
import {describe, it, expect} from '@jest/globals';
const path = require('path');
require('dotenv').config({
  path: path.resolve(process.cwd(), '.test.env'),
});
import app from '../index';

const request = require('supertest');

describe('Test the onecall API endpoint', () => {
  it('should return right timezone', async () => {
    const response = await request(app).post('/api/forecast/').send({
      lat: 4.8472,
      long: 6.9746,
    });
    const data = JSON.parse(response.text);
    expect(data.timezone).toBe('Africa/Lagos');
  });
  it('should return a 404 error code when lat is not provided', async () => {
    const response = await request(app).post('/api/forecast/').send({
      long: 7.2334,
    });
    expect(response.status).toEqual(404);
  });

  it('should return a 404 error code when long is not provided', async () => {
    const response = await request(app).post('/api/forecast/').send({
      lat: 14.2334,
    });
    expect(response.status).toEqual(404);
  });

  it('should return a 404 error code when both lat and long is not provided', async () => {
    const response = await request(app).post('/api/forecast/');
    expect(response.status).toEqual(404);
  });

  it('should return proper error message when lat is not provided', async () => {
    const response = await request(app).post('/api/forecast/').send({
      long: 7.4524,
    });
    expect(response.text).toEqual('lat and long must be defined');
  });

  it('should return proper error message when long is not provided', async () => {
    const response = await request(app).post('/api/forecast/').send({
      lat: 13.4524,
    });
    expect(response.text).toEqual('lat and long must be defined');
  });

  it('should return proper error message when lat and long is not provided', async () => {
    const response = await request(app).post('/api/forecast/');
    expect(response.text).toEqual('lat and long must be defined');
  });
});

describe('Test the weather API endpoint', () => {
  it('should return data for right country', async () => {
    const response = await request(app).post('/api/search/').send({
      name: 'Alaska',
    });
    const data = JSON.parse(response.text);
    expect(data.name).toBe('Alaska');
  });

  it('should return a 404 error code when look_up is not provided', async () => {
    const response = await request(app).post('/api/search/');
    expect(response.status).toEqual(404);
  });

  it('should return proper error message when look_up is not provided', async () => {
    const response = await request(app).post('/api/search/');
    expect(response.text).toEqual('Name must be defined');
  });
});
