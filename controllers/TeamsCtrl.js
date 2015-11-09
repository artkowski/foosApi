var config = require('../config')
	, Team = require('../models/Team')
	, Competition = require('../models/Competition')
	, AuthCtrl = require('./AuthCtrl')
	, _ = require('lodash')

module.exports = function() {
	var TeamsCtrl = {
		getAll: getAll,
		get: get,
		add: add,
		edit: edit,
		remove: remove
	}
	return TeamsCtrl;

	function getAll(req, res, next) {
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
	}

	function get(req, res, next) {
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
	}	

	function add(req, res, next) {
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

	}

	function edit(req, res, next) {
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
	}

	function remove(req, res, next) {
		// console.log(req.params.id);
		Team.remove({_id: req.params.id}, function(err) {
			if(err) return next(err);
			res.json({success: true});
		})
	}

}()
