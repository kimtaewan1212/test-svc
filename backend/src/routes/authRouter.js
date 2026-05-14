'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

const router = Router();

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.post('/refresh',  ctrl.refresh);
router.post('/logout',   auth, ctrl.logout);

module.exports = router;
