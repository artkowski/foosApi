var express = require('express'),
	router = express.Router(),
	League = require('../../models/League'),
	Player = require('../../models/Player');

var resource = '/:leagueId/players';

router
.get(resource, function(req, res, next) {
	console.log(req.params)
	Player.find({_league: req.params.leagueId}, function(err, player) {
		if(err) return next(err);
		res.json({
			succes: true, player: player
		});
	})
	// res.json({
	// 	post: req.body,
	// 	params: req.params
	// })
})
.post(resource, function(req, res) {
	var player = new Player(req.body);

})

module.exports = router;