'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/userController');

const router = Router();

router.get('/',    ctrl.getMe);
router.patch('/',  ctrl.updateMe);
router.delete('/', ctrl.deleteMe);

module.exports = router;
