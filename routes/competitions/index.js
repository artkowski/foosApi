var express = require('express'),
	router = express.Router({mergeParams: true}),
	CompetitionsCtrl = require('../../controllers/CompetitionsCtrl');
	AuthCtrl = require('../../controllers/AuthCtrl');
	TournamentsCtrl = require('../../controllers/TournamentsCtrl');
	
var authMiddlewares = [
	AuthCtrl.verify,
	TournamentsCtrl.checkOwner
];

router
.get('/', CompetitionsCtrl.getAll)
.get('/:id', CompetitionsCtrl.get)
.post('/', authMiddlewares, CompetitionsCtrl.add)
.put('/:id', authMiddlewares, CompetitionsCtrl.edit)
.patch('/:id', authMiddlewares, function(req, res, next) {
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
.delete('/:id', authMiddlewares, CompetitionsCtrl.remove)

module.exports = router;