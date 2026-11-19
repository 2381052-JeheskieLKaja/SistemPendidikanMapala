const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/laporanController');

router.get('/', role(['admin']), c.rekap);

module.exports = router;
