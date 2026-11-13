const express = require("express");
const { checkApi, checkDatabase, seedMock } = require("../controllers/health.controller");

const router = express.Router();

router.get("/", checkApi);
router.get("/db", checkDatabase);
router.post("/seed", seedMock);

module.exports = router;
