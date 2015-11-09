var config = require('../../config');
var router = require('express').Router();
var AuthCtrl = require('../../controllers/AuthCtrl');

router
.post('/login', AuthCtrl.login)
.get('/check', AuthCtrl.verify)
.get('/check', AuthCtrl.check);



module.exports = router;