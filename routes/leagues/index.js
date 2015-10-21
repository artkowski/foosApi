var express = require('express');
var router = express.Router();
var League = require('../../models/League');

router
// getAll leagues
.get('/', function(req, res) {
	League.find(function(err, leagues) {
		if(err) return res.status(500).json({ success: false, error: err });
		res.json(leagues);
	})
})
// get leauge by ID
.get('/:id', function(req, res, next) {
	League.findById(req.params.id, function(err, league) {
		if(err) return res.status(400).json({ success: false, error: err });
		if(err) next(err);
		res.json(league);
	})
})
// create league
.post('/', function(req, res) {
	var league = new League(req.body);
	league.save(function(err, saved) {
		if(err) return res.status(400).json({ success: false, error: err });
		res.json({success: true, league: saved});
	})
})
// edit league
.put('/:id', function(req, res) {
	League.findById(req.params.id, function(err, league) {
		if (err) return res.status(400).json({success: false, error: err});
		league = _.extend(league, req.body);
		league.save(function(err, leagueUpdated) {
			if(err) {
				return res.status(400).json({success: false, error: err});
			}
			res.json({success: true, league: leagueUpdated});
		});
	});
})
.delete('/:id', function(req, res) {
	League.remove({_id: req.params.id}, function(err) {
		if(err) return res.status(400).json({success: false, error: err});
		res.json({success: true});
	})
})

module.exports = router;