const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/evaluasiController');

router.use(role(['pengurus']));
router.get('/', c.list);
router.post('/', c.simpan);

module.exports = router;
