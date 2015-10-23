var express = require('express'),
	router = express.Router(),
	Competition = require('../../../../models/Competition'),
	Tournament = require('../../../../models/Tournament'),
	_ = require('lodash');

var resource = '/:leagueId/tournaments/:tournamentId/competitions';

router
.get(resource, function(req, res, next) {
	Competition
		.find({_tournament: req.params.tournamentId})
		.sort({created: -1})
		.exec(function(err, competition) {
			if(err) return next(err);
			res.json(competition);
		})
})
.get(resource + '/:id', function(req, res, next) {
	Competition.findById(req.params.id)
		// .populate({
		// 	path: 'matches'
		// })
		.exec(function(err, competition) {
			if(err) {
				err.status = 400;
				next(err);
			}
			res.json(competition);
		})
})
.post(resource, function(req, res, next) {
	// craete tournament
	var competition = new Competition(req.body);
	competition._tournament = req.params.tournamentId;
	competition.save(function(err) {
		if(err) {
			err.status = 400;
			return next(err);
		}
		// add to tournament
		Tournament.findById(req.params.tournamentId, function(err, tournament) {
			tournament.competitions.push(competition);
			tournament.save(function(err) {
				if(err) next(err);
				// success
				res.json({
					success: true,
					competition: competition
				});
			});
		});

	});

})
.put(resource + '/:id', function(req, res, next) {
	Competition.findById(req.params.id, function(err, competition) {
		if(err) {
			err.status = 400;
			return next(err);
		}
		competition = _.extend(competition, req.body);
		competition.save(function(err) {
			if(err) {
				err.status = 400;
				return next(err);
			}
			res.json({success: true, competition: competition});
		});
	});
})
.delete(resource + '/:id', function(req, res, next) {
	// console.log(req.params.id);
	Competition.remove({_id: req.params.id}, function(err) {
		if(err) return next(err);
		res.json({success: true});
	})
})


module.exports = router;