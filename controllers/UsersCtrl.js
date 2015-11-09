var User = require('../models/User')
	, config = require('../config')
	, pwd = require('pwd')
	, _ = require('lodash')

module.exports = function() {
	var UsersCtrl = {
		getAll: getAll,
		add: add,
		edit: edit,
		remove: remove
	}

	return UsersCtrl;

	function getAll(req, res, next) {
		User.find().select({password: 0}).exec( function(err, users) {
			if(err) return next(err);
	  	res.json(users);
		});
	}

	/** get user by Id
	/* 
	*/
	function add(req, res, next) {
		var user = new User(req.body);
		pwd.hash(user.password, config.salt, function(err, hash) {
			if(err) return next(err);

			user.password = hash;
			user.save(function(err, user) {
				if(err) {
					err.status = 400;
					return next(err);
				} 
				user.password = '';
				delete user.password;
				res.json({success: true, user: user});
			});

		})
	}

	function edit(req, res, next) {
		// find and update in one call to the database
		// User.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
		// 	if(err) return res.json({success: false, error: err});
		// 	user = _.extend(user, req.body);
		// 	res.json({success: true, user: user});
		// });

		// if we need hooks and validation:
		User.findById(req.params.id).select({password: 0})
		.exec(function(err, user) {
			if (err) return res.status(400).json({success: false, error: err});
			user = _.extend(user, req.body);
			user.save(function(err) {
				if(err) {
					return res.status(400).json({success: false, error: err});
				}
				// user.select({password: 0})
				return res.json({success: true, user: user});
			});
		});
	}

	function remove(req, res) {
		// console.log(req.params.id);
		User.remove({_id: req.params.id}, function(err) {
			if(err) return console.error(err);
			res.json({success: true});
		})
	}
}()