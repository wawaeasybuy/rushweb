'use strict';

var _ = require('lodash');
var Wallet = require('./wallet.model');

var validationError = function(res, err) {
	return res.json(422, err);
};

function handleError(res, err) {
	return res.json(500, err);
};


// show wallet
exports.show = function (req, res) {

	var user = req.user;
	var userId = user._id;

	Wallet.findOne({_user: userId}, function (err, wallet) {
		if (err) {
			return handleError(res, err);
		}
		if (!wallet) {
			return res.json(404, {error: {msg: 'wallet is not found'}});
		}
		res.json(200, wallet);
	});
};


// update wallet
exports.update = function (req, res) {

	var user = req.user;
	var userId = user._id;

	var creditCard = {};
	var bank = req.body.bank,
		cardId = req.body.cardId;
	var action = req.body.action;

	if (!action) {
		return res.json(400, {error: {msg: 'action is required'}});
	}
	if (!bank) {
		return res.json(400, {error: {msg: 'bank is required'}});
	}
	if (!cardId) {
		return res.json(400, {error: {msg: 'cardId is required'}});
	}
	creditCard = {bank: bank, cardId: cardId};

	Wallet.findOne({_user: userId}, function (err, wallet) {
		if (err) {
			return handleError(res, err);
		}
		if (!wallet) {
			return res.json(404, {error: {msg: 'wallet is not found'}});
		}
		console.log('wallet is found');

		var updateCreditCard = wallet.creditCard;
		switch (action) {
		case 'add':
			updateCreditCard.push(creditCard);
			break;
		case 'delete':
			_.pull(updateCreditCard, creditCard);
			break;
		default: 
			return res.json(400, {error: {msg: 'action is wrong'}});
			// break;
		}

		var updateWallet = _.assign(wallet, {creditCard: updateCreditCard});
		updateWallet.save(function (err, result) {
			if (err) {
				return handleError(res, err);
			}
			console.log('update wallet success');
			res.json(200, wallet);
		});
	});
};