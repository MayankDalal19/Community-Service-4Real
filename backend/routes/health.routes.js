const express = require("express");
const { checkApi, checkDatabase, seedMock, cleanMock } = require("../controllers/health.controller");

const router = express.Router();

router.get("/", checkApi);
router.get("/db", checkDatabase);
router.post("/seed", seedMock);
router.post("/clean", cleanMock);

module.exports = router;
