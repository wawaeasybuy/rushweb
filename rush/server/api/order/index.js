'use strict';

var express = require('express');
var controller = require('./order.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

// router.post('/', hasRole(['user']), controller.create);
router.post('/', controller.create);
router.get('/', auth.hasRole(['user']), controller.show);
router.put('/:id', controller.update);
router.put('/:id/delete', controller.delete);

module.exports = router;