var express = require('express')
	, router = express.Router()
	, UsersCtrl = require('../../controllers/UsersCtrl')
	, AuthCtrl = require('../../controllers/AuthCtrl')

router
.all(/.*/, AuthCtrl.verify).all(/.*/, AuthCtrl.isAdmin)
.get('/', UsersCtrl.getAll)
.post('/', UsersCtrl.add)
.put('/:id', UsersCtrl.edit)
.delete('/:id', UsersCtrl.remove)

module.exports = router;