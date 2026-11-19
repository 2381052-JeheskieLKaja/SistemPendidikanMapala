const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const { uploadMateri } = require('../middlewares/upload');
const c = require('../controllers/materiController');

const pengelola = role(['admin', 'pengurus']);

router.get('/saya', role(['siswa']), c.saya);
router.get('/:id/file', role(['admin', 'pengurus', 'siswa']), c.file);
router.get('/', pengelola, c.list);
router.post('/', pengelola, uploadMateri, c.create);
router.put('/:id', pengelola, uploadMateri, c.update);
router.delete('/:id', pengelola, c.remove);

module.exports = router;
