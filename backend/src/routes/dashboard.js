const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/dashboardController');

router.get('/', role(['admin', 'pengurus', 'siswa']), c.ringkasan);

module.exports = router;
