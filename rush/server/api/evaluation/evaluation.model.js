'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var EvaluationSchema = new Schema({

	_order: {
		type: String, 
		ref: 'Order'
	},
	_userInfo: {
		type: String, 
		ref: 'Userinfo'
	},
	comment: String,
	score: { 
		type: Number,
		default: 5
	}

});

module.exports = mongoose.model('Evaluation', EvaluationSchema);