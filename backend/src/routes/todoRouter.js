'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/todoController');

const router = Router();

router.get('/',          ctrl.getAll);
router.post('/',         ctrl.create);
router.get('/:id',       ctrl.getById);
router.patch('/:id',     ctrl.update);
router.delete('/:id',    ctrl.remove);
router.patch('/:id/done', ctrl.toggleDone);

module.exports = router;
