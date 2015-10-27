var express = require('express'),
	router = express.Router(),
	Competition = require('../../models/Competition'),
	Tournament = require('../../models/Tournament'),
	Match = require('../../models/Match'),
	_ = require('lodash');

var resource = '/leagues/:leagueId/tournaments/:tournamentId/competitions';

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
		.deepPopulate('matches.team1.players matches.team2.players')
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
.patch(resource + '/:id', function(req, res, next) {
	var competitionId  = req.params.id;
	console.log(req.body, req.params);
	// akcja start
	if(req.body.action == 'start') {
		Competition
		// szukamy competetion
		.findById(competitionId)
		// chcemy mieć drużyny podpięte
		.deepPopulate('teams')	// deepPopulate - ustawione sortowanie
		.exec(function(err, competition) {
			if(err) return next(err);
			// jak już mamy comeptition
			// usuwamy wszystkie mecze
			deleteCompetitionMatches(competition, function(err) {
				if(err) return next(err);
			});
			// generujemy listę meczy
			matches = generateListOfMatches(competition);
			// zapisujemy każdy
			_.each(matches, function(match) {
				match.save(function(err) {
					if(err) return next(err);
				});
			});
			// dopisujemy mecze do konkurencji
			competition.matches = matches;
			competition.save(function(err) {
				// success
				res.json(matches);
				
			})
		});
		
	}
})
.delete(resource + '/:id', function(req, res, next) {
	// console.log(req.params.id);
	Competition.remove({_id: req.params.id}, function(err) {
		if(err) return next(err);
		res.json({success: true});
	})
})

function deleteCompetitionMatches(competition, cb) {
	return Match.remove({_competition: competition._id}, cb);
}

function generateListOfMatches(competition) {
	var matchList = [];
	if(competition.type === "2KO"
		|| competition.type === "1KO") {
		console.log('nb of teams', competition.teams.length);
		// na podstawie special wiem które drużyny z jaką grają (wg rankingu)
		var special = [
			0, 1/2,	// 2 teams
			1/4, 3/4,	// 4 teams
			1/8, 5/8, 3/8, 7/8,	// 8 teams
			1/16, 9/16, 5/16, 13/16, 3/16, 11/16, 7/16, 15/16, // 16 teams
			1/32, 17/32, 25/32, 9/32, 5/32, 21/32, 13/32, 29/32,
			3/32, 19/32, 27/32, 11/32, 7/32, 23/32, 15/32, 31/32 //32 teams
		];
		var treeSize = 1;
		while(treeSize < competition.teams.length) {
			treeSize*= 2;
		};
		// s -start, e - end; początkowa i końcowa drużyna
		var s = 0,
			e = treeSize-1;
		console.log('treeSize', treeSize);
		// rozstawienie:
		for(var i = 0; i < treeSize/2; i++) {
			var jump = special[i] * treeSize;
			var idx_s = s + jump;
			var idx_e = e - jump;
			console.log(idx_s+1, idx_e+1);	// działa! :D

			var match = new Match({
				_competition: competition._id,
				team1: competition.teams[idx_s] || null,
				team2: competition.teams[idx_e] || null,
				order: matchList.length + 1
			});
			matchList.push(match);
		}
	}

	return matchList;
}

module.exports = router;