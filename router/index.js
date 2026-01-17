// router/index.js
const express = require('express');
const router = express.Router();
const defineRoutes = require('./routes'); // routes.js'i çağır

// Router'ı fonksiyonun içine göndererek rotaları tanımlamasını sağla
defineRoutes(router);

module.exports = router;