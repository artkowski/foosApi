var express = require('express'),
	router = express.Router(),
	Team = require('../models/Team'),
	Competition = require('../models/Competition'),
	_ = require('lodash');

var resource = '/leagues/:leagueId/tournaments/:tournamentId'
		+ '/competitions/:competitionId/teams';

router
.get(resource, function(req, res, next) {
	Team
		.find({_competition: req.params.competitionId})
		// .find()
		.sort({totalPoints: -1})
		.populate({
			path: 'players'
		})
		.exec(function(err, team) {
			if(err) return next(err);
			res.json(team);
		})
})
.get(resource + '/:id', function(req, res, next) {
	Team.findById(req.params.id)
		// .populate({
		// 	path: 'matches'
		// })
		.exec(function(err, team) {
			if(err) {
				err.status = 400;
				next(err);
			}
			res.json(team);
		})
})
.post(resource, function(req, res, next) {
	// craete team
	// TODO sprawdzać, czy gracz nie jest już zapisany
	var team = new Team(req.body);
	team._competition = req.params.competitionId;
	team.save(function(err) {
		if(err) {
			err.status = 400;
			return next(err);
		}
		// add to competition
		Competition.findById(req.params.competitionId, function(err, competition) {
			competition.teams.push(team);
			competition.save(function(err) {
				if(err) next(err);
				// success
				// get team with populate
				Team.findOne(team).populate('players').exec(function(err, team) {
					if(err) next(err);
					res.json({
						success: true,
						team: team
					});
					
				});
			});
		});

	});

})
.put(resource + '/:id', function(req, res, next) {
	Team.findById(req.params.id, function(err, team) {
		if(err) {
			err.status = 400;
			return next(err);
		}
		team = _.extend(team, req.body);
		team.save(function(err) {
			if(err) {
				err.status = 400;
				return next(err);
			}
			res.json({success: true, team: team});
		});
	});
})
.delete(resource + '/:id', function(req, res, next) {
	// console.log(req.params.id);
	Team.remove({_id: req.params.id}, function(err) {
		if(err) return next(err);
		res.json({success: true});
	})
})


module.exports = router;