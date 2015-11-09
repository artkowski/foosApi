var config = require('../config')
	, League = require('../models/League')
	, AuthCtrl = require('./AuthCtrl')
	, _ = require('lodash')

module.exports = function() {
	var _populateTournaments = {
		path: 'tournaments',
		select: {_league: 0 },
		options: {
			sort: {created: -1}
		}
	};

	var LeaguesCtrl = {
		getAll: getAll,
		get: get,
		add: add,
		edit: edit,
		remove: remove,
		checkOwner: checkOwner
	}
	return LeaguesCtrl;

		function getAll(req, res, next) {
		League.find(function(err, leagues) {
			if(err) next(err);
			res.json(leagues);
		})
	}

	function get(req, res, next) {
		League.findById(req.params.leagueId)
			// .populate('players')
			.select({players: 0})
			.populate(_populateTournaments)
			.populate('owners')
			.exec(function(err, league) {
			if(err) {
				err.status = 400;
				next(err);
			}
			res.json(league);
		})
	}

	function add(req, res, next) {
		var league = new League(req.body);
		league.owners = [req.decoded.id];
		league.save(function(err) {
			if(err) {
				err.status = 400;
				return next(err);
			}
			return res.json({success: true, league: league});
		})
	}

	function edit(req, res, next) {
		League.findById(req.params.leagueId)
		.populate(_populateTournaments)
		.exec(function(err, league) {
			if (err) return res.status(400).json({success: false, error: err});
			league = _.extend(league, req.body);
			league.save(function(err) {
				if(err) {
					err.status = 400;
					next(err);
				}
				res.json({success: true, league: league});
			});
		});
	}

	function remove(req, res) {
		League.remove({_id: req.params.leagueId}, function(err) {
			if(err) return res.status(400).json({success: false, error: err});
			res.json({success: true});
		})
	}


	function checkOwner(req, res, next) {
		console.log('leagues middleware')
		if(!req.decoded) return next({status: 403});
		console.log('Decoded', req.decoded)
		console.log('Checking owner...')
		AuthCtrl.isAdmin(req, res, function(err) {
			// jeżeli nei było errora - jest adminienm, przechodzimy dalej
			if(!err) {
				console.log('User is admin');
				return next();
			}

			League.find({
				_id: req.params.leagueId,
				owners: { $in: [req.decoded.id]}
			}).exec(function(err, league) {
				if(err || !league.length) {
					console.log('zły owner')
					return next({status: 403});
				}
				console.log('dobry owner');
				next();
			})
		});
	}


}()