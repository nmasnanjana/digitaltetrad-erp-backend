import express from "express";
import permissionController from "../controllers/permissionController";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

// Get all permissions
router.get("/", 
    checkPermission("permission", "read"),
    permissionController.getAllPermissions
);

// Get permissions by module
router.get("/module/:module",
    checkPermission("permission", "read"),
    permissionController.getPermissionsByModule
);

// Assign permissions to role
router.post("/roles/:roleId",
    checkPermission("permission", "assignpermissionstorole"),
    permissionController.assignPermissionsToRole
);

// Remove permissions from role
router.delete("/roles/:roleId",
    checkPermission("permission", "assignpermissionstorole"),
    permissionController.removePermissionsFromRole
);

// Scan and sync permissions
router.post("/scan",
    checkPermission("permission", "scanandsyncpermissions"),
    permissionController.scanAndSyncPermissions
);

export default router; 