'use strict';

var _ = require('lodash');
var User = require('../user/user.model');
var Userinfo = require('../userinfo/userinfo.model');
var Order = require('./order.model');

var validationError = function(res, err) {
	return res.json(422, err);
};

function handleError(res, err) {
	return res.json(500, err);
};


// create order
exports.create = function (req, res) {

	var sendShipper = req.body.sendShipper;
	var receiver = req.body.receiver;
	var goodCategory = req.body.goodCategory;
	var orderStatus = req.body.orderStatus;

	var date = {createDate: new Date()};

	if (!sendShipper) {
		return res.json(400, {error: {msg: 'sendShipper is required'}});
	}
	if (!receiver) {
		return res.json(400, {error: {msg: 'receiver is required'}});
	}
	if (!goodCategory) {
		return res.json(400, {error: {msg: 'goodCategory is required'}});
	}
	if (!orderStatus) {
		return res.json(400, {error: {msg: 'orderStatus is required'}});
	}

	if (orderStatus == 'submited') {
		_.assign(date, {submitedTime: new Date()});
	}

	Userinfo.findById(sendShipper, function (err, userInfo) {
		if (err) {
			return handleError(res, err);
		}
		if (!userInfo) {
			return res.json(400, {error: {msg: 'userInfo is not found'}});
		}
		console.log('userInfo is found');

		Order.create(_.assign(req.body, date), function (err, order) {
			if (err) {
				return handleError(res, err);
			}
			res.json(200, order);
		});
	});
};


// update order content
exports.update = function (req, res) {

	var orderId = req.params.id;
	var status = req.query.status;

	var sendShipper = req.body.sendShipper;
	var receiver = req.body.receiver;
	var goodCategory = req.body.goodCategory;

	if (status) {
		console.log('modify order status');

		var orderStatus = {};

		switch (status) {
		case 'submited':
			orderStatus = {orderStatus: status, submitedTime: new Date};
			break;
		case 'received':
			orderStatus = {orderStatus: status, receivedTime: new Date};
			console.log(orderStatus);
			break;
		case 'delivered':
			orderStatus = {orderStatus: status, deliveredTime: new Date};
			break;
		case 'finished':
			orderStatus = {orderStatus: status, finishTime: new Date};
			break;
		case 'cancel':
			orderStatus = {orderStatus: status};
			break;
		default:
			return res.json(400, {error: {msg: 'status is wrong'}});
		}

		Order.findById(orderId, function (err, order) {
			if (err) {
				return handleError(res, err);
			}
			if (!order) {
				return res.json(404, {error: {msg: 'order is not found'}});
			}
			console.log('order has found');

			var updateOrder = _.assign(order, orderStatus);
			updateOrder.save(function (err, result) {
				if (err) {
					return handleError(res, err);
				}
				res.json(200, result);
			});
		});

	} else {
		console.log('modify order content');

		if (!sendShipper && !receiver && !goodCategory) {
			return res.json(400, {error: {msg: 'condition is required'}});
		}

		Order.findById(orderId, function (err, order) {
			if (err) {
				return handleError(res, err);
			}
			if (!order) {
				return res.json(404, {error: {msg: 'order is not found'}});
			}
			console.log('order has found');

			var updateOrder = _.assign(order, req.body);
			updateOrder.save(function (err, result) {
				if (err) {
					return handleError(res, err);
				}
				return res.json(200, result);
			});
		});
	}
};


// delete order
exports.delete = function (req, res) {

	var orderId = req.params.id;

	Order.findById(orderId, function (err, order) {
		if (err) {
			return handleError(res, err);
		}
		if (!order) {
			return res.json(404, {error: {msg: 'order is not found'}});
		}
		var updateOrder = _.assign(order, {isDelete: true});
		updateOrder.save(function (err, result) {
			if (err) {
				return handleError(res, err);
			}
			res.json(200, result);
		});
	});
};


// show order when user search
exports.show = function (req, res) {

	var user = req.user;
	var userId = user._id;

	var longitude = req.query.longitude,
		latitude = req.query.latitude;
	var transport = req.query.transport;
	var time = req.query.time;
	var state = req.query.state;
	var page = req.query.page || 1,
		itemsPerPage = req.query.itemsPerPage || 12;

	if (time && longitude && latitude && transport && !state) {
		console.log('user search order');

		Order.findOne({transport: transport, isDelete: false, orderStatus: 'submited'}, function (err, order) {
			if (err) {
				return handleError(res, err);
			}
			if (!order) {
				return res.json(404, {error: {msg: 'order is not found'}});
			}
			return res.json(200, order);
		});

	} else if (!time && !longitude && !latitude && !transport && state) {
		console.log('show order list');

		User.findById(userId, function (err, user) {
			if (err) {
				return handleError(res, err);
			}
			var userInfoId = user._userInfo;

			switch (state) {
			case '1':
				Order.find({sendShipper: userInfoId, isDelete: false})
				.count(function (err, cnt1) {
					if (err) {
						return handleError(res, err);
					}
					console.log(cnt1);
					if (!cnt1) {
						return res.json(404, {error: {msg: 'order is not found'}});
					}

					Order.find({sendShipper: userInfoId, isDelete: false}, {}, {
						skip: (page - 1) * itemsPerPage,
						limit: itemsPerPage
					})
					.sort({'createDate': -1})
					.exec(function (err, orders) {
						if (err) {
							return handleError(res, err);
						}
						res.json(200, orders);
					});
				});
				break;
			case '2':
				Order.find({thirdPartPerson: userInfoId, isDelete: false})
				.count(function (err, cnt1) {
					if (err) {
						return handleError(res, err);
					}
					console.log(cnt1);
					if (!cnt1) {
						return res.json(404, {error: {msg: 'order is not found'}});
					}

					Order.find({thirdPartPerson: userInfoId, isDelete: false}, {}, {
						skip: (page - 1) * itemsPerPage,
						limit: itemsPerPage	
					})
					.sort({'createDate': -1})
					.exec(function (err, orders) {
						if (err) {
							return handleError(res, err);
						}
						res.json(200, orders);
					});
				});
				break;
			default:
				break;
			}
		});

	} else {
		return res.json(400, {error: {msg: 'condition is lost'}});
	}
};