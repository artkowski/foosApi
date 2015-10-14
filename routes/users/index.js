var express = require('express');
var router = express.Router();
var _ = require('lodash')
var User = require('../../models/User')

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
		res.json({success: true, user: user});
	});
	// res.end();
})
.put('/:id', function(req, res) {
	// find and update in one call to the database
	User.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
		if(err) return console.error(err);
		user = _.extend(user, req.body);
		res.json({success: true, user: user});
	});


	// if we need hooks and validation:
	// User.findById(req.params.id, function(err, user) {
	// 	if (err) return console.error(err);
	// 	user = _.extend(user, req.body);
	// 	user.save(function(err, savedUser) {
	// 		res.json({success: true, user: savedUser});
	// 	});
	// })
})
.delete('/:id', function(req, res) {
	console.log(req.params.id);
	User.remove({_id: req.params.id}, function(err) {
		if(err) return console.error(err);
		res.json({success: true});
	})
})

module.exports = router;