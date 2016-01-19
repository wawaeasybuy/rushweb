'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var UserinfoSchema = new Schema({

	name: String,
	headPortrait: String,
	email: String,
	tel: String,
	score: {
		type: Number,
		default: 5
	}
});

module.exports = mongoose.model('Userinfo', UserinfoSchema);