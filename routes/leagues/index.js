var express = require('express');
var router = express.Router();
var League = require('../../models/League');

router
// getAll leagues
.get('/', function(req, res, next) {
	League.find(function(err, leagues) {
		if(err) next(err);
		res.json(leagues);
	})
})
// get league by ID
.get('/:id', function(req, res, next) {
	League.findById(req.params.id)
		// .populate('players')
		.select({players: 0})
		.populate({
			path: 'tournaments',
			select: {_league: 0 },
			options: {
				sort: {created: -1}
			}
		})
		.exec(function(err, league) {
		if(err) {
			err.status = 400;
			next(err);
		}
		res.json(league);
	})
})
// create league
.post('/', function(req, res) {
	var league = new League(req.body);
	league.save(function(err) {
		if(err) {
			err.status = 400;
			next(err);
		}
		res.json({success: true, league: league});
	})
})
// edit league
.put('/:id', function(req, res) {
	League.findById(req.params.id, function(err, league) {
		if (err) return res.status(400).json({success: false, error: err});
		league = _.extend(league, req.body);
		league.save(function(err) {
			if(err) {
				err.status = 400;
				next(err);
			}
			res.json({success: true, league: league});
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