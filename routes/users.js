var express = require('express');
var router = express.Router();
var _ = require('lodash')
var User = require('../models/User')

router
.get('/', function(req, res, next) {
	User.find(function(err, users) {
		if(err) console.error(err);
  	res.json(users);
	})
})
.post('/', function(req, res) {
	console.log(req.body);
	var user = new User(req.body);
	user.save(function(err, user) {
		if(err) {
			return console.error(err);
		} 
		res.json({response: true, user: user});
	});
	// res.end();
})
.put('/:id', function(req, res) {
	// User.findOneAndUpdate({ _id: req.body._id }, { $set: req.body }, function(err, user) {
	// 	if(err) return console.error(err);
	// 	console.log(user, newuser);
	// 	res.json({response: true, user: user});
	// });
	User.findById(req.params.id, function(err, user) {
		if (err) return console.error(err);
		user = _.extend(user, req.body);
		user.save(function(err, savedUser) {
			res.json({response: true, user: savedUser});
		});
	})
})
.delete('/:id', function(req, res) {
	console.log(req.params.id);
	User.remove({_id: req.params.id}, function(err) {
		if(err) return console.error(err);
		res.json({response: true});
	})
})

module.exports = router;