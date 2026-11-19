const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/programController');

// Baca: admin & pengurus (pengurus perlu memilih program). Tulis: admin saja.
router.get('/', role(['admin', 'pengurus']), c.list);
router.get('/:id', role(['admin', 'pengurus']), c.detail);
router.post('/', role(['admin']), c.create);
router.put('/:id', role(['admin']), c.update);
router.delete('/:id', role(['admin']), c.remove);

module.exports = router;
