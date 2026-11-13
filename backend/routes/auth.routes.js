const express = require("express");
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);

// Protected routes (require valid JWT)
router.get("/me", authenticate, authController.me);
router.put("/profile", authenticate, authController.updateProfile);
router.put("/change-password", authenticate, authController.changePassword);

module.exports = router;
