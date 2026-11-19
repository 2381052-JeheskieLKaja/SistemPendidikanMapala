const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/profilController');

router.use(role(['admin', 'pengurus', 'siswa']));
router.get('/me', c.me);
router.put('/me', c.update);
router.put('/me/password', c.gantiPassword);

module.exports = router;
