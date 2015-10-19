var express = require('express');
var router = express.Router();

router.use(function(req, res, next) {
	// do logging
	// console.log('Request...');
	next();
})

router.use('/auth', require('./auth'))
router.use('/users', require('./users'))
router.use('/league', require('./league'))

router.get('/', function(req, res, next) {
	// res.render('index', { title: 'Express' });
  res.send('Index response');
});

module.exports = router;