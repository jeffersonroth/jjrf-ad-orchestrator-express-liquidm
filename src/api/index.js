const express = require('express');

const liquidm = require('./liquidm');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/liquidm', liquidm);

module.exports = router;
