var express = require('express');
var router = express.Router();

router.use(function(req, res, next) {
	// do logging
	// console.log('Request...');
	next();
})

router.use('/auth', require('./auth'))
router.use('/users', require('./users'))
router.use('/leagues', require('./leagues'))
router.use('/leagues', require('./leagues/players'))
router.use('/leagues', require('./leagues/tournaments'))
router.use('/leagues', require('./leagues/tournaments/competitions'))

router.get('/', function(req, res, next) {
	// res.render('index', { title: 'Express' });
  res.send('Index response');
});

module.exports = router;