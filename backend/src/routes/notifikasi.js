const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/notifikasiController');

router.use(role(['siswa']));
router.get('/', c.list);
router.put('/:id/dibaca', c.tandaiDibaca);

module.exports = router;
