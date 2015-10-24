var config = require('../../config');
var router = require('express').Router();
var jwt = require('jsonwebtoken');	// create, sign and verify tokens

var User = require('../../models/User')

router
.post('/login', function(req, res) {
	User.findOne({
		name: req.body.login
	}, function(err, user) {
		if(err) return authError(err, res);
		// check if user found

		console.log(user);
		if(!user) {
			return res.status(401).json({
				success: false, 
				message: "Authentication failed. User not found." 
			});
		} else {
			// check password
			if(user.password != req.body.pass) {
				return res.status(401).json({
					success: false,
					message: 'Auth failed. Wrong password.'
				});
			} else {
				// it is ok, create token
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
					user: user,
					exp: expires
				});
			}
		}

	});
})
.get('/check', function(req, res, next) {
	// verify a token

	// check header, url
	req.token = req.headers.token || req.query.token || false;

	if(req.token) {

		jwt.verify(req.token, config.secret, function(err, decoded) {
			if(err) {
				return res.status(403).json({
					success: false,
					message: 'Failed to authenticate token.'
				});
			} else {
				req.decoded = decoded;
				console.log(decoded);
				// zapisalismy rozkodowany token, przechodzimy do następnego middleware
				next();
			}
		})

	} else {
		// żeby nie wywalał błędy zwracam 200 ale obsługuje success przez frontend
		return res.json({
			success: false,
			message: 'No token provided'
		});
	}
})
.get('/check', function(req, res) {
	// response
	console.log(req.decoded);
	User.findById(req.decoded.id, function(err, user) {
		// jeżeli nie znajdzie usera
		if(err) return res.status(403);
		// success - zwracamy dane usera
		res.json({
			success: true,
			user: user,
			token: req.token,
			exp: req.decoded.exp
		});
	});

});



function authError(err, res) {
	return res.status(401).json({success: false, error: err});
}

module.exports = router;