var express = require('express'),
	router = express.Router({mergeParams: true}),
	AuthCtrl = require('../../controllers/AuthCtrl'),
	TournamentsCtrl = require('../../controllers/TournamentsCtrl');

router
.get('/', 
	TournamentsCtrl.getAll)
// get tournament by ID
.get('/:tournamentId', 
	TournamentsCtrl.get)

.post('/', AuthCtrl.verify, 
	TournamentsCtrl.add)

.put('/:tournamentId', [AuthCtrl.verify, TournamentsCtrl.checkOwner],
	TournamentsCtrl.edit)

.delete('/:tournamentId', [AuthCtrl.verify, TournamentsCtrl.checkOwner],
 TournamentsCtrl.remove)


module.exports = router;