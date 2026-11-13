const express = require("express");
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Listing roles is available to authenticated users (e.g., for forms/filters)
router.get("/roles", userController.getRoles);

// Admin only user management
router.use(authorize("Admin"));
router.get("/", userController.listUsers);
router.post("/", userController.createUser);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
