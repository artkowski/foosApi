var express = require('express'),
	router = express.Router({mergeParams: true}),
	TeamsCtrl = require('../controllers/TeamsCtrl'),
	AuthCtrl = require('../controllers/AuthCtrl'),
	TournamentsCtrl = require('../controllers/TournamentsCtrl'),
	_ = require('lodash');

var authMiddlewares = [
	AuthCtrl.verify,
	TournamentsCtrl.checkOwner
];

router
.get('/', TeamsCtrl.getAll)
.get('/:id', TeamsCtrl.get)
.post('/', authMiddlewares, TeamsCtrl.add)
.put('/:id', authMiddlewares, TeamsCtrl.edit)
.delete('/:id', authMiddlewares, TeamsCtrl.remove)


module.exports = router;