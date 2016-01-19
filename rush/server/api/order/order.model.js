'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var OrderSchema = new Schema({

	// person who want send good
	sendShipper: {
		type: String, 
		ref: 'Userinfo'
	},
	sendShipperTel: String,
	sendTimeStart: Date,
	sendTimeEnd: Date,
	sendAddress: String,
	sendAddressLongitude: String,
	sendAddressLatitude: String,

 	//person who receive good
	receiver: {
		type: String, 
		ref: 'Userinfo'
	},
	receiverTel: String,
	receiveTime: Date,  
	receiverAddress: String,
	receiverAddressLongitude: String,
	receiverAddressLatitude: String,

	//good information
	goodCategory: String,
	goodWeight: String,
	goodVolume: String,
	transport: String,
	goodCharacter: [{
		type: String,  
		ref: 'Tag'
	}],
	goodPhoto: [String],

	//third person information
	thirdPartPerson: {
		type: String, 
		ref: 'Userinfo'
	},
	thirdPartPersonTel: String,

	//order status
	isDelete: {
		type: Boolean, 
		default: false
	},
	orderStatus: String,          
	submitedTime: Date,
	receivedTime: Date,
	deliveredTime: Date,
	finishTime: Date,

	createDate: Date,
	deliveryPrice: Number,

});

module.exports = mongoose.model('Order', OrderSchema);