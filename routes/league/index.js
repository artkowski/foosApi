var express = require('express');
var router = express.Router();
var League = require('../../models/League');

router
.get('/', function(req, res) {
	League.find(function(err, leagues) {
		if(err) return res.status(500).json({ success: false, error: err });
		res.json(leagues);
	})
})
.get('/:id', function(req, res) {
	League.findById(req.params.id, function(err, league) {
		if(err) return res.status(500).json({ success: false, error: err });
		res.json(league);
	})
})
.post('/', function(req, res) {
	var league = new League(req.body);
	league.save(function(err, saved) {
		if(err) return res.status(400).json({ success: false, error: err });
		res.json({success: true, league: saved});
	})
})
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