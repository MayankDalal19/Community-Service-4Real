const express = require('express');

const router = express.Router();

router.use('/health', require('./health.routes'));
router.use('/auth', require('./auth.routes'));

// Future modules get mounted here, e.g.:
// router.use('/volunteers', require('./volunteer.routes'));

module.exports = router;
