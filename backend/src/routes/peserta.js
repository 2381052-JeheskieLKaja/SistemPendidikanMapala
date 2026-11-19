const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/pesertaController');

// Tidak ada ubah/hapus peserta (K11).
router.use(role(['admin']));
router.get('/', c.list);
router.post('/', c.create);

module.exports = router;
