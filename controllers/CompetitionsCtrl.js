var Competition = require('../models/Competition'),
	// Tournament = require('../models/Tournament'),
	// Match = require('../models/Match'),
	_ = require('lodash');


module.exports = function() {
	var CompetitionsCtrl = {
		getAll: getAll
	};

	return CompetitionsCtrl;

	function getAll(req, res, next) {
		Competition
		.find({_tournament: req.params.tournamentId})
		.sort({created: -1})
		.exec(function(err, competition) {
			if(err) return next(err);
			res.json(competition);
		})
	}

}();