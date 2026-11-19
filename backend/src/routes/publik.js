const router = require('express').Router();
const c = require('../controllers/publikController');

router.get('/program', c.program);

module.exports = router;
