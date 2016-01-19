'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var WalletSchema = new Schema({

	_user: {
		type: String,
		ref: 'User'
	},
	_userInfo: {
		type: String,
		ref: 'Userinfo'
	},
	creditCard: [{
		bank: String,
		cardId: String
	}],
	hashPassword: String,
	deposit: String,
	coupon: [String]

});

module.exports = mongoose.model('Wallet', WalletSchema);