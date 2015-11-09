var express = require('express'),
	router = express.Router({mergeParams: true}),
	PlayersCtrl = require('../../controllers/PlayersCtrl'),
	AuthCtrl = require('../../controllers/AuthCtrl'),
	LeaguesCtrl = require('../../controllers/LeaguesCtrl')

var authMiddlewares = [ 
	AuthCtrl.verify,
	LeaguesCtrl.checkOwner
];

router
.get('/', PlayersCtrl.getAll)
// only league owner
.post('/', authMiddlewares, PlayersCtrl.add)
.put('/:id', authMiddlewares, PlayersCtrl.edit)
.delete('/:id', authMiddlewares, PlayersCtrl.remove)


module.exports = router;