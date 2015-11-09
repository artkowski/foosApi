var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

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
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");

  if ('OPTIONS' == req.method) { 
	  return res.sendStatus(200); 
	} 
	next(); 
});

app.set('secret', config.secret);
app.use('/', routes);
// app.use('/', users);

// error handling
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.json({
	  message: err.message,
	  error: err
	});
});


mongoose.connect(config.database);
// otwieramy połaczenie do bazydanych
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	console.log('Db connection opend');
});

app.set('trust proxy', 'loopback', '127.0.0.1', '192.168.1.12');

// server
var server = app.listen(config.port, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});

