import express from "express";
import UserController from "../controllers/userController";

const router = express.Router();

// User routes
router.post("/register", UserController.createUser); // Create a new user
router.get("/all", UserController.getAllUsers); // Get all users
router.get("/:id", UserController.getUserByID); // Get user by ID
router.delete("/:id", UserController.deleteUserByID); // Delete user by ID
router.put("/:id", UserController.updateUserByID); // Update user details
router.put("/:id/password", UserController.updateUserPassword); // Update user password
router.post("/login", UserController.userLogin); // User login
router.put("/:id/activity", UserController.updateUserActivity); // Update user activity status

export default router;