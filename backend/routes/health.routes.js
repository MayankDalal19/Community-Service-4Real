const express = require('express');
const { checkApi, checkDatabase } = require('../controllers/health.controller');

const router = express.Router();

router.get('/', checkApi);
router.get('/db', checkDatabase);

module.exports = router;
