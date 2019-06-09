const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.all('*', cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄'
  });
});

const encodedfavicon = require('./static/encoded_favicon');

const favicon = new Buffer.from(JSON.stringify(encodedfavicon.favicon), 
  'base64'); 
app.get("/favicon.ico", function(req, res) {
 res.statusCode = 200;
 res.setHeader('Content-Length', favicon.length);
 res.setHeader('Content-Type', 'image/x-icon');
 res.setHeader("Cache-Control", "public, max-age=2592000");
 res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
 res.end(favicon);
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
