import express from "express";
import RoleController from "../controllers/roleController";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

// Role routes
router.post("/", RoleController.createRole); // Create a new role
router.get("/", RoleController.getAllRoles); // Get all roles
router.get("/:id", RoleController.getRoleById); // Get role by ID
router.delete("/:id", RoleController.deleteRole); // Delete role by ID
router.put("/:id", RoleController.updateRole); // Update role details

export default router; 