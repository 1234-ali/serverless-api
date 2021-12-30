const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./app/route');

module.exports.handler = serverless(app);