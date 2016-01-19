'use strict';

var express = require('express');
var controller = require('./userinfo.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', controller.create);
router.get('/:id', controller.show);
router.put('/', auth.hasRole(['admin', 'user']), controller.update);

module.exports = router;