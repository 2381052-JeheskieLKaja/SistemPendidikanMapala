const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/jadwalController');

const pengurus = role(['pengurus']);

router.get('/saya', role(['siswa']), c.saya);
router.get('/', pengurus, c.list);
router.post('/', pengurus, c.create);
router.put('/:id', pengurus, c.update);
router.delete('/:id', pengurus, c.remove);

module.exports = router;
