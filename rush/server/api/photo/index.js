'use strict';

var express = require('express');
var controller = require('./photo.controller');
// var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/good', controller.uploadGood);

module.exports = router;