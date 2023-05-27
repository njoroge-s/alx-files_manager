const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

const router = router();

router.get('/status', getStatus);
router.get('/stats', getStats);
router.post('/users', UsersController.postNew);

export default router;
