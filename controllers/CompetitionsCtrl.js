var Competition = require('../models/Competition'),
	Tournament = require('../models/Tournament'),
	Match = require('../models/Match'),
	_ = require('lodash');


module.exports = function() {
	var CompetitionsCtrl = {
		getAll: getAll,
		get: get,
		add: add,
		edit: edit,
		remove: remove,
		startCompetition: startCompetition,
		callMatch: callMatch,
		clearCalls: clearCalls,
		selectWinner: selectWinner
	};

	return CompetitionsCtrl;

	function getAll(req, res, next) {
		console.log(req.params)
		Competition
		.find({_tournament: req.params.tournamentId})
		.sort({created: -1})
		.exec(function(err, competition) {
			if(err) return next(err);
			res.json(competition);
		})
	}

	function get(req, res, next) {
		Competition.findById(req.params.id)
		.deepPopulate('matches.team1.players matches.team2.players matches.winner.players', {
			populate: {
				'matches': {
					options: {
						sort: {
							round: 1,
							order: 1
						}
					}
				}
			}
		})
		.exec(function(err, competition) {
			if(err) {
				err.status = 400;
				next(err);
			}
			res.json(competition);
		})
	}

	function add(req, res, next) {
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
	}

	function edit(req, res, next) {
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
	}

	function remove(req, res, next) {
		// console.log(req.params.id);
		Competition.remove({_id: req.params.id}, function(err) {
			if(err) return next(err);
			res.json({success: true});
		})
	}

	/**
	* start competition
	* req.params.id - competitionId
	* return matches
	*/
	function startCompetition(req, res, next) {
		var competitionId  = req.params.id;

		Competition
		// szukamy competetion
		.findById(competitionId)
		// chcemy mieć drużyny razem z graczami, bo później zostaną zwrócone
		.deepPopulate('teams.players')	// deepPopulate - ustawione sortowanie
		.exec(function(err, competition) {
			if(err) return next(err);
			// jak już mamy comeptition
			// usuwamy wszystkie mecze
			deleteCompetitionMatches(competition, function(err) {
				if(err) return next(err);

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
				competition.startSize = matches.length;
				competition.save(function(err) {
					// success
					return res.json(matches);
					
				})
			});
		});
		
	}

	/**
	* callMatch
	* req.body.table - table number
	* req.body.matchId - matchID
	* return {success, match}
	*/
	function callMatch(req, res, next) {
		var table = req.body.table || null;
		var matchId = req.body.matchId;
		Match.findById( matchId , function(err, match) {
			if(err || !match || !!match.winner) {
				if(!match) err = {status: 400};
				return next(err);
			}
			match.calls.push({ table: table });
			match.save(function(err) {
				if(err) return next(err);
				// success
				return res.json({
					success: true,
					match: match
				})
			})

		})
	}

	/*
	* clearCalls
	* winner nie może być ustawiony
	* req.body.matchId
	* return success
	*/
	function clearCalls(req, res, next) {
		var matchId = req.body.matchId;
		Match.findById( matchId , function(err, match) {
			if(err || !match || !!match.winner) {
				if(!match) err = {status: 400};
				return next(err);
			}
			match.calls = [];
			match.save(function(err) {
				if(err) return next(err);
				// success
				return res.json({
					success: true
				})
			})

		})
	}

	function selectWinner(req, res, next) {
		var matchId = req.body.matchId;
		var winnerId = req.body.winnerId;
		Match.findById(matchId)
		// .populate('team1').populate('team2')
		.populate({
			path: '_competition',
			options: {
				select: {matches: 0, teams: 0}
			}
		})
		.exec(function(err, match) {
			if(err || !match) {
				if(!match) err = {status: 400, message: 'Match not found'};
				return next(err);
			}
			match.winner = winnerId;

			var winner, looser;
			if(match.team1+'' === winnerId) {
				winner = match.team1;
				looser = match.team2;
			} else {
				winner = match.team2;
				looser = match.team1;
			}

			// zamiast cb można użyć primses
			setMatchWinner(match, winner, next, function(newMatch) {
				console.log('setMatchWinner READY');
				setMatchLooser(match, looser, next, function(newMatch) {
					console.log('setMatchLooser READY');

					// zapisujemy
					match.save(function(err) {
						if(err) return next(err);
						res.json({
							success: true
						});
					});
				});
			});

		});
	}

	function setMatchWinner(match, team, next, cb) {
		var competition = match._competition;
		if(competition.type === "2KO") {
			console.log(competition.type);
			var newMatch = {
				_competition: match._competition
			};
			if(match.losses == 0) {
				// jeżeli jesteśmy na stronie wygranych
				// i nie jest to runda pierwsza to przeskakujemy o 3 rundy
				newMatch.round = match.round === 1 ? 2 : match.round + 3;
			} else if(match.losses == 1) {
				// jeżeli jest to strona przegranych
				newMatch.round = match.round + 1;
				//sprawdzamy czy nie wypadła runda wygranych
				while(!isWinnersRound(newMatch.round)) {
					// jeżeli tak to powiększamy
					newMatch.round++;
				}
			}
			// jeżeli jesteśm na przegranych i przeskoczyliśmy tylko jedną rundę,
			// to order zostaje taki sam
			if(match.losses && match.round + 1 === newMatch.round) {
				newMatch.order = match.order;
			} else {
				// w innym przypadku liczymy połowe poprzedniego ordera zaokrąglonego w górę
				newMatch.order = Math.ceil(match.order/2);
				
			}
			
			console.log('round', match.round);
			console.log('nextRound', newMatch.round);
			console.log('order', newMatch.order);


			Match.findOne(newMatch, function(err, findMatch) {
				if(err) return next(err);
				if(findMatch) {
					console.log('Znaleziono')
					newMatch = findMatch;
				} else {
					console.log('Nowy mecz');
					newMatch = new Match(newMatch);
					addMatchToCompetition(competition._id, newMatch._id, next);
				}
				console.log(newMatch.team1+'' === match.team1+'')
				// sprawdzamy czy nie ma gdzieś wypełnionej drużyny, którąś z naszego meczy
				// gdyby byłyo to ustawiamy na null, ponieważ będziemy wprowadzać aktualizację
				if(newMatch.team1+'' == match.team1+'' || newMatch.team1+'' == match.team2+'') {
					newMatch.team1 = null;
				}
				if(newMatch.team2+'' == match.team1+'' || newMatch.team2+'' == match.team2+'') {
					newMatch.team2 = null;
				}


				if(!!newMatch.team1 && !!newMatch.team2) {
					return next({status: 400, message: 'Match has all the teams'});
				}

				// przypisyanie drużyny do nowego meczu
				if(match.order%2 || !!newMatch.team2) {
					// jeżeli nieparzyste to winner leci do team1
					// jeżeli newMatch.team2 jest zajęty to też tutaj
					newMatch.team1 = team;
				} else {
					// jeżeli parzyste to do team2
					newMatch.team2 = team;
				}
				newMatch.save(function(err) {
					if(err) return next(err);
					cb(newMatch);
				})
				
			})

		}
		// console.log(match._competition)
	}	

	function setMatchLooser(match, team, next, cb) {
		var competition = match._competition;
		if(competition.type === "2KO") {
			if(match.losses > 0) {
				console.log('Gracz odpada')
				// można ustawić, że gracz odpada
				return cb();
			}
			var newMatch = {
				_competition: match._competition
			};
			newMatch.round = match.round + 2;
			newMatch.losses = match.losses +1;
			if(match.round === 1) {
				newMatch.order = Math.ceil(match.order/2);
			} else {
				// dla rundy 2 jest taki:
				// match.round - tutaj potrzebujemy która to jest runda po tej stronie
				// winnerRound - ile było round wygranych
				// winnerRound = Math.floor(match.round/ 3) + match.round%3;
				var roundNbOfMatch = competition.startSize / (2*Math.floor((newMatch.round-1)/3));
				console.log(newMatch.round, roundNbOfMatch)
				// chujowy pomysł z tym dzieleniem
				newMatch.order = roundNbOfMatch - match.order+1;
			}

			Match.findOne(newMatch, function(err, findMatch) {
				if(err) return next(err);
				if(findMatch) {
					newMatch = findMatch;
				} else {
					console.log('Nowy mecz');
					newMatch = new Match(newMatch);
					addMatchToCompetition(competition._id, newMatch._id);
				}

				// przegranego dajemy do team2, chyba że nie jest wolna
				if(!!newMatch.team2) {
					newMatch.team2 = team;
				} else {
					newMatch.team1 = team;
				}

				newMatch.save(function(err) {
					if(err) return next(err);
					cb(newMatch);
				})
				
			})

		}
	}

	// private
	function isWinnersRound(round) {
		return (round-2)%3;
	}

	function deleteCompetitionMatches(competition, cb) {
		return Match.remove({_competition: competition._id}, cb);
	}

	function addMatchToCompetition(competitionId, matchId, next, cb) {
		Competition.findById(competitionId, function(err, competition) {
			if(err) next(err);
			competition.matches.push(matchId);
			competition.save(cb);
		});
	}

	function generateListOfMatches(competition) {
		var matchList = [];
		if(competition.type === "2KO"
			|| competition.type === "1KO") {
			console.log('nb of teams', competition.teams.length);
			// na podstawie special wiem które drużyny z jaką grają (wg rankingu)
			var special = [
				0, 1/2,	// 2 matches
				1/4, 3/4,	// 4 matches
				1/8, 5/8, 3/8, 7/8,	// 8 matches
				1/16, 9/16, 5/16, 13/16, 3/16, 11/16, 7/16, 15/16, // 16 matches
				1/32, 17/32, 25/32, 9/32, 5/32, 21/32, 13/32, 29/32,
				3/32, 19/32, 27/32, 11/32, 7/32, 23/32, 15/32, 31/32 //32 matches
			];
			// ustawienie wielkości drzewka
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


}();
