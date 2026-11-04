const express = require('express');
const crudRouter = require('../utils/crudRouter');
const modules = require('../controllers/modules.controller');

const router = express.Router();

router.use('/health', require('./health.routes'));
router.use('/stats', require('./stats.routes'));

// Step 2: core NGO modules (each gets GET/POST/PUT/DELETE)
router.use('/volunteers', crudRouter(modules.volunteers));
router.use('/donors', crudRouter(modules.donors));
router.use('/donations', crudRouter(modules.donations));
router.use('/beneficiaries', crudRouter(modules.beneficiaries));
router.use('/assistance', crudRouter(modules.assistance));
router.use('/events', crudRouter(modules.events));

// Step 3 will add: router.use('/auth', require('./auth.routes'));

module.exports = router;
