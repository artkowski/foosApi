var config = require('../config')
	, jwt = require('jsonwebtoken')	// create, sign and verify tokens
	, User = require('../models/User')
	, pwd = require('pwd')
	, _ = require('lodash')

// @ngInject
module.exports = function() {
	var AuthCtrl = {
		login: login,
		verify: verifyToken,
		check: checkDecoded,
		isAdmin: isAdmin
	}

	return AuthCtrl;

	function login(req, res, next) {
		User.findOne({
			name: req.body.login
		}, function(err, user) {
			if(err) return next({status: 401});
			// check if user found

			console.log(user);
			if(!user) {
				return res.status(401).json({
					success: false, 
					message: "Authentication failed. User not found." 
				});
			} else {
				// check password
				pwd.hash(req.body.pass, config.salt, function(err, hash) {
					if(err || user.password !== hash) return res.status(401).json({
						success: false,
						message: 'Auth failed. Wrong password.'
					});
					// if it's ok, create token
					var expires = 600;

					var token = jwt.sign({
						id: user._id,
						name: user.name
					}, config.secret, {
						expiresIn: 600
					});

					return res.json({
						success: true,
						token: token,
						user: _.omit(user, 'password'),
						exp: expires
					});
				});
			}

		});
	}

	function verifyToken(req, res, next) {
		// verify a token
		console.log('verify token')
		// check header, url
		req.token = req.headers.token || req.query.token || false;

		if(req.token) {

			jwt.verify(req.token, config.secret, function(err, decoded) {
				if(err) {
					// console.log('Failed to authenticate token');
					// return next();
					return res.status(401).json({	// 401 - Unauthorized i frontend robi logout
						success: false,
						message: 'Failed to authenticate token.'
					});
				} else {
					req.decoded = decoded;
					console.log(decoded);
					// zapisalismy rozkodowany token, przechodzimy do następnego middleware
					return next();
				}
			})

		} else {
			// nie ma tokenu, przechodzimy dalej w req.decoded nie ma nic
			// console.log('No token provided');
			// return next();
			return next({status: 403, message: 'Forbidden. No token provided'});
			// żeby nie wywalał błędu zwracam 200 ale obsługuje success przez frontend
			// return res.json({
			// 	success: false,
			// 	message: 'No token provided'
			// });
		}
	}

	function checkDecoded(req, res, next) {
		// response
		if(!req.decoded) next({status: 401});

		console.log(req.decoded);
		User.findById(req.decoded.id).select({password: 0}).exec(function(err, user) {
			// jeżeli nie znajdzie usera
			if(err) return next({status: 401});
			// success - zwracamy dane usera
			return res.json({
				success: true,
				user: user,
				token: req.token,
				exp: req.decoded.exp
			});
		});

	}

	function isAdmin(req, res, cb) {
		if(!req.decoded) return cb({status: 403, message: 'Forbidden. No token provided'});
		User.findById(req.decoded.id).select({admin: 1})
		.exec(function(err, user) {
			if(err || !user.admin) return cb({status: 403});
			return cb(null, user);
		});

	}

}();