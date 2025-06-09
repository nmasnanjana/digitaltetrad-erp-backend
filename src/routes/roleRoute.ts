import express from "express";
import RoleController from "../controllers/roleController";

const router = express.Router();

// Role routes
router.post("/", RoleController.createRole); // Create a new role
router.get("/", RoleController.getAllRoles); // Get all roles
router.get("/:id", RoleController.getRoleByID); // Get role by ID
router.delete("/:id", RoleController.deleteRoleByID); // Delete role by ID
router.put("/:id", RoleController.updateRoleByID); // Update role details

export default router; 