const express = require("express");
const { login, register, getMe, getRoles } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/roles", getRoles);
router.get("/me", protect, getMe);

module.exports = router;
