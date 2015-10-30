var express = require('express'),
	router = express.Router(),
	CompetitionsCtrl = require('../../controllers/CompetitionsCtrl');

var resource = '/leagues/:leagueId/tournaments/:tournamentId/competitions';

router
.get(resource, CompetitionsCtrl.getAll)
.get(resource + '/:id', CompetitionsCtrl.get)
.post(resource, CompetitionsCtrl.add)
.put(resource + '/:id', CompetitionsCtrl.edit)
.patch(resource + '/:id', function(req, res, next) {
	console.log(req.body, req.params);
	// akcja start
	if(req.body.action == 'start') {
		return CompetitionsCtrl.startCompetition(req, res, next);
	} else if(req.body.action == 'callMatch') {
		return CompetitionsCtrl.callMatch(req, res, next);
	} else if(req.body.action == 'clearCalls') {
		return CompetitionsCtrl.clearCalls(req, res, next);
	} else if(req.body.action == 'selectWinner') {
		return CompetitionsCtrl.selectWinner(req, res, next);
	}
	
	return next({status: 400});
})
.delete(resource + '/:id', CompetitionsCtrl.remove)

module.exports = router;