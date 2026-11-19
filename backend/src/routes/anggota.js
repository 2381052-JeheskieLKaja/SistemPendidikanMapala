const router = require('express').Router();
const role = require('../middlewares/roleMiddleware');
const c = require('../controllers/anggotaController');

router.use(role(['admin']));
router.get('/', c.list);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
