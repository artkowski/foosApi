var config = require('../config')
	, League = require('../models/League')
	, Player = require('../models/Player')
	, AuthCtrl = require('./AuthCtrl')
	, _ = require('lodash')

module.exports = function() {

	var PlayersCtrl = {
		getAll: getAll,
		add: add,
		edit: edit,
		remove: remove
	}
	return PlayersCtrl;

 function getAll(req, res, next) {
		console.log(req.params)
		Player
			.find({_league: req.params.leagueId})
			// .populate('_league')
			.select({_league: false})
			.sort({points: -1})
			.exec(function(err, players) {
				if(err) return next(err);
				res.json(players);
			})
	}

	function add(req, res, next) {
		var player = new Player(req.body);
		player._league = req.params.leagueId;
		player.save(function(err) {
			if(err) {
				err.status = 400;
				return next(err);
			}
			// dodanie player do ligi
			League.findById(req.params.leagueId, function(err, league) {
				league.players.push(player);
				league.save(function(err) {
					if(err) return next(err);
					// return success
					res.json({
						success: true,
						player: player
					});
				});

			});
		});

	}

	function edit(req, res, next) {
		Player.findById(req.params.id, function(err, player) {
			if(err) {
				err.status = 400;
				return next(err);
			}
			player = _.extend(player, req.body);
			player.save(function(err) {
				if(err) {
					err.status = 400;
					return next(err);
				}
				res.json({success: true, player: player});
			});
		});
	}

	function remove(req, res, next) {
		// console.log(req.params.id);
		Player.remove({_id: req.params.id}, function(err) {
			if(err) return next(err);
			res.json({success: true});
		})
	}

}()