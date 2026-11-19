const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/kurikulumController');

// Tidak ada DELETE kurikulum (sesuai Gambar 6).
router.use(role(['admin']));
router.get('/', c.list);
router.post('/', c.create);
router.put('/:id', c.update);

module.exports = router;
