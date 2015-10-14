var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');	// create, sign and verify tokens
var config = require('./config');

// var multer = require('multer'); // v1.0.5
// var upload = multer(); // for parsing multipart/form-data


var routes = require('./routes');
// var models = require('./models')
// var users = require('./routes/users');

// bodyParser to get data in req.body
app.use(bodyParser.json());

// use logger
app.use(morgan('dev'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access_token, domainID");
  next();
});

app.use('/', routes);
// app.use('/', users);


mongoose.connect('mongodb://localhost/foosDb');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	console.log('Db connection opend');
});

var server = app.listen(config.port, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});