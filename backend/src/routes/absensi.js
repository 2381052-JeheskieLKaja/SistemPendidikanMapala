const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/absensiController');

// Pembaruan absensi lewat upsert POST (tidak ada PUT /api/absensi/:id).
router.get('/saya', role(['siswa']), c.saya);
router.get('/', role(['pengurus']), c.list);
router.post('/', role(['pengurus']), c.simpan);

module.exports = router;
