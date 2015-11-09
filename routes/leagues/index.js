var express = require('express'),
	router = express.Router(),
	AuthCtrl = require('../../controllers/AuthCtrl'),
	LeaguesCtrl = require('../../controllers/LeaguesCtrl')


router
// getAll leagues
.get('/', LeaguesCtrl.getAll)
// get league by ID
.get('/:leagueId', LeaguesCtrl.get)
// create league
// only logged user can create league
.post('/', AuthCtrl.verify, LeaguesCtrl.add)
// verify
.all('/:leagueId', AuthCtrl.verify)
// check owner
.all('/:leagueId', LeaguesCtrl.checkOwner)
// edit league
.put('/:leagueId', LeaguesCtrl.edit)
.delete('/:leagueId', LeaguesCtrl.remove)

module.exports = router;