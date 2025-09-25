import express from "express";
import SettingsController from "../controllers/settingsController";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

// Public endpoint to get logo and company name (no auth required)
router.get("/public", SettingsController.getPublicSettings);

// Get settings
router.get("/", 
    checkPermission('settings', 'read'),
    SettingsController.getSettings
);

// Update settings
router.put("/", 
    checkPermission('settings', 'update'),
    SettingsController.updateSettings
);

// Reset settings to defaults
router.post("/reset", 
    checkPermission('settings', 'update'),
    SettingsController.resetSettings
);

export default router; 