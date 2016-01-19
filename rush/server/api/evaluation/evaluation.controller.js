'use strict';

var _ = require('lodash');
var Evaluation = require('./evaluation.model');
var Order = require('../order/order.model');
var Userinfo = require('../userinfo/userinfo.model');

var validationError = function(res, err) {
	return res.json(422, err);
};

function handleError(res, err) {
	return res.json(500, err);
};


// create evaluation
exports.create = function (req, res) {

	var orderId = req.body._order;
	var userInfoId = req.body._userInfo;
	var comment = req.body.comment;
	var score = req.body.score;

	if (!orderId) {
		return res.json(400, {error: {msg: 'orderId is required'}});
	}
	if (!userInfoId) {
		return res.json(400, {error: {msg: 'userInfoId is required'}});
	}
	if (!comment) {
		return res.json(400, {error: {msg: 'comment is required'}});
	}
	if (!score) {
		return res.json(400, {error: {msg: 'score is required'}});
	}

	Order.findById(orderId, function (err, order) {
		if (err) {
			return handleError(res, err);
		}
		if (!order) {
			return res.json(404, {error: {msg: 'order is not found'}});
		}
		Userinfo.findById(userInfoId, function (err, userInfo) {
			if (err) {
				return handleError(res, err);
			}
			if (!userInfo) {
				return res.json(404, {error: {msg: 'userInfo is not found'}});
			}
			console.log('create evaluation');

			Evaluation.create(req.body, function (err, evaluation) {
				if (err) {
					return handleError(res, err);
				}
				console.log('has create evaluation');

				var currentScore = evaluation.score;

				Userinfo.findById(userInfoId, function (err, userInfo2) {
					if (err) {
						return handleError(res, err);
					}
					var updateUserInfo = _.assign(userInfo2, {score: currentScore});
					updateUserInfo.save(function (err, result) {
						if (err) {
							return handleError(res, err);
						}
						res.json(200, {
							evaluation: evaluation,
							userInfo: userInfo2
						});
					});
				});
			});
		});
	});
};


// show evaluation
exports.show = function (req, res) {

	var orderId = req.params.id;

	Evaluation.findOne({_order: orderId}, function (err, evaluation) {
		if (err) {
			return handleError(res, err);
		}
		if (!evaluation) {
			return res.json(404, {error: {msg: 'evaluation is not found'}});
		}

		res.json(200, evaluation);
	});
};