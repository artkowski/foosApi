var express = require('express'),
	router = express.Router(),
	Tournament = require('../../../models/Tournament'),
	League = require('../../../models/League'),
	_ = require('lodash');

var resource = '/:leagueId/tournaments';

router
.get(resource, function(req, res, next) {
	Tournament
		.find({_league: req.params.leagueId})
		.sort({created: -1})
		.exec(function(err, tournaments) {
			if(err) return next(err);
			res.json(tournaments);
		})
})
.post(resource, function(req, res, next) {
	// craete tournament
	var tournament = new Tournament(req.body);
	// TODO optional leagueId
	tournament._league = req.params.leagueId;
	tournament.save(function(err) {
		if(err) {
			err.status = 400;
			return next(err);
		}
		// add to league
		// TODO optional:
		League.findById(req.params.leagueId, function(err, league) {
			league.tournaments.push(tournament);
			league.save(function(err) {
				if(err) next(err);
				// success
				res.json({
					success: true,
					tournament: tournament
				});
			});
		});

	});

})
.put(resource + '/:id', function(req, res, next) {
	Tournament.findById(req.params.id, function(err, tournament) {
		if(err) {
			err.status = 400;
			return next(err);
		}
		tournament = _.extend(tournament, req.body);
		tournament.save(function(err) {
			if(err) {
				err.status = 400;
				return next(err);
			}
			res.json({success: true, tournament: tournament});
		});
	});
})
.delete(resource + '/:id', function(req, res, next) {
	// console.log(req.params.id);
	Tournament.remove({_id: req.params.id}, function(err) {
		if(err) return next(err);
		res.json({success: true});
	})
})


module.exports = router;