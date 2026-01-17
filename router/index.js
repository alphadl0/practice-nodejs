const express = require('express');
const router = express.Router();
const routes = require('./routes'); 

routes(router);
module.exports = router;