const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/progresController');

router.use(role(['siswa']));
router.post('/tandai-akses', c.tandaiAkses);
router.get('/saya', c.saya);

module.exports = router;
