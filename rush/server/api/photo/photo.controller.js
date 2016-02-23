'use strict';

var express = require("express");
var multer = require('multer');
var app = express();

function handleError(res, err) {
    return res.json(500, err);
};

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        console.log('b');
        console.log(__dirname);
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        console.log('b');
        callback(null, file.fieldname + '-' + Date.now());
    }
});

// var upload = multer({dest: 'photo/good/'}).single('good');
var upload = multer({storage: storage}).single('good');

exports.uploadGood = function (req, res) {

    upload(req, res, function(err) {
        if (err) {
            return handleError(res, err);
        }
        res.json(200, {msg: "File is uploaded"});
    });
};


// app.get('/',function(req,res){
//       res.sendFile(__dirname + "/index.html");
// });

// app.post('/api/photo', function(req,res){
//   console.log('a');
    
// });

// app.listen(3000,function(){
//     console.log("Working on port 3000");
// });