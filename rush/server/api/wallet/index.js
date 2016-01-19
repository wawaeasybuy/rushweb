'use strict';

var express = require('express');
var controller = require('./wallet.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.put('/', auth.hasRole(['user']), controller.update);
router.get('/', auth.hasRole(['user']), controller.show);

module.exports = router;