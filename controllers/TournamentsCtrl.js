var config = require('../config')
	, Tournament = require('../models/Tournament')
	, League = require('../models/League')
	, AuthCtrl = require('./AuthCtrl')
	, _ = require('lodash')

module.exports = function() {
	var _getPopulateOptions = {
		path: 'competitions',
		select: {_tournament: 0 },
		options: {
			sort: {created: -1}
		}
	};

	var TournamentsCtrl = {
		getAll: getAll,
		get: get,
		add: add,
		edit: edit,
		remove: remove,
		checkOwner: checkOwner
	}
	return TournamentsCtrl;

	function getAll(req, res, next) {
		Tournament
			.find({_league: req.params.leagueId})
			.sort({created: -1})
			.exec(function(err, tournaments) {
				if(err) return next(err);
				return res.json(tournaments);
			});
	}

	function get(req, res, next) {
		Tournament.findById(req.params.tournamentId)
			.populate(_getPopulateOptions)
			.populate('owners')
			.exec(function(err, tournament) {
				if(err) return next(err);
				if(!tournament) return next({status: 400});

				res.json(tournament);
		})
	}

	function add(req, res, next) {
		// craete tournament
		var tournament = new Tournament(req.body);
		tournament.owners = [req.decoded.id];
		// TODO optional leagueId
		tournament._league = req.params.leagueId;
		tournament.save(function(err) {
			if(err) {
				err.status = 400;
				return next(err);
			}
			// add to league
			// TODO optional league:
			League.findById(req.params.leagueId, function(err, league) {
				if(err || !league) {
					err = err || { status: 400 };
					return next(err);
				}
				league.tournaments.push(tournament);
				league.save(function(err) {
					if(err) next(err);
					// success
					return res.json({
						success: true,
						tournament: tournament
					});
				});
			});

		});

	}

	function edit(req, res, next) {
		Tournament.findById(req.params.tournamentId)
		.populate(_getPopulateOptions)
		.exec(function(err, tournament) {
			if(err || !tournament) {
				err = err || { status: 400 }	// error or not found
				return next(err);
			}
			tournament = _.extend(tournament, req.body);
			// tournament.owners.push('563bcc61f5759aee38607de6');
			tournament.save(function(err) {
				if(err) {
					err.status = 400;
					return next(err);
				}
				res.json({success: true, tournament: tournament});
			});
		});
	}

	function remove(req, res, next) {
		// console.log(req.params.tournamentId);
		Tournament.remove({_id: req.params.tournamentId}, function(err) {
			if(err) return next(err);
			return res.json({success: true});
		});
	}

	function checkOwner(req, res, next) {
		// forbidden jeżeli nie ma decoded
		if(!req.decoded) return next({status: 403});
		AuthCtrl.isAdmin(req, res, function(err) {
			// jeżeli nei było errora - jest adminienm, przechodzimy dalej
			if(!err) {
				return next();
			}

			Tournament.find({
				_id: req.params.tournamentId,
				owners: { $in: [req.decoded.id]}
			}).exec(function(err, tournament) {
				if(err) return next(err);
				if(!tournament.length) return next({status: 403});
				return next();
			});
		});

	}

}();