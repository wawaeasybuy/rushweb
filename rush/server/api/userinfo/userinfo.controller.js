'use strict';

var _ = require('lodash');
var User = require('../user/user.model');
var Userinfo = require('./userinfo.model');
var Wallet = require('../wallet/wallet.model');

var validationError = function(res, err) {
	return res.json(422, err);
};

function handleError(res, err) {
	return res.json(500, err);
};

var createUser = function (user, cb) {
	var newUser = new User(user);
	newUser.provider = 'local';
	newUser.role = 'user';
	newUser.save(cb);
};


// create user
exports.create = function (req, res) {

	var creditCard = {};
	var account = req.body.account;
	var name = req.body.name;
	var password = req.body.password;
	var bank = req.body.bank,
		cardId = req.body.cardId;

	if (!account) {
		return res.json(400, {error: {msg: 'account is required'}});
	}
	if (!name) {
		return res.json(400, {error: {msg: 'name is required'}});
	}
	if (!password) {
		return res.json(400, {error: {msg: 'password is required'}});
	}
	if (!bank) {
		return res.json(400, {error: {msg: 'bank is required'}});
	}
	if (!cardId) {
		return res.json(400, {error: {msg: 'cardId is required'}});
	}

	creditCard = {bank: bank, cardId: cardId};

	User.findOne({account: account}, function (err, user) {
		if (err) {
			return handleError(res, err);
		}
		if (user) {
			return res.json(409, {error: {msg: 'account is already in use'}});
		}
		console.log('create user\'s information');

		Userinfo.create({tel: account, name: name}, function (err, userInfo) {
			if (err) {
				return handleError(res, err);
			}
			var userInfoId = userInfo._id;
			console.log('create user\'s information success, next create user');

			createUser({account: account, password: password, _userInfo: userInfoId, createDate: new Date()}, function (err, user) {
				if (err) {
					Userinfo.findByIdAndRemove(userInfoId);
					return validationError(res, err);
				}
				var userId = user._id;
				console.log('create user success, next create wallet');

				Wallet.create({_user: userId, _userInfo: userInfoId, creditCard: creditCard}, function (err, wallet) {
					if (err) {
						return handleError(res, err);
					}
					console.log('create wallet success');

					res.json(200, {
						user: user,
						userInfo: userInfo,
						wallet: wallet
					});
				});
			});
		});
	});
};


// show user's information
exports.show = function (req, res) {

	var userInfoId = req.params.id;

	Userinfo.findById(userInfoId, function (err, userInfo) {
		if (err) {
			return handleError(res, err);
		}
		if (!userInfo) {
			return res.json(404, {error: {msg: 'userInfo is not found'}});
		}
		console.log('userInfo is found');

		res.json(200, userInfo);
	});
};


// update user's information
exports.update = function (req, res) {

	var user = req.user;
	var userInfoId = user._userInfo;

	var name = req.body.name;
	var email = req.body.email;
	var tel = req.body.tel;

	console.log(req.body);

	if (!name) {
		return res.json(400, {error: {msg: 'name is required'}});
	}
	if (!email) {
		return res.json(400, {error: {msg: 'email is required'}});
	}
	if (!tel) {
		return res.json(400, {error: {msg: 'tel is required'}});
	}

	Userinfo.findById(userInfoId, function (err, userInfo) {
		if (err) {
			return handleError(res, err);
		}
		if (!userInfo) {
			return res.json(404, {error: {msg: 'userInfo is not found'}});
		}
		console.log('userinfo is found.');

		var updateUserInfo = _.assign(userInfo, req.body);
		updateUserInfo.save(function (err, result) {
			if (err) {
				return handleError(res, err);
			}
			console.log('user\'s information update success');
			res.json(200, result);
		});
	});
};