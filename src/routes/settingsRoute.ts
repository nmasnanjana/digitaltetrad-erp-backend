import express from "express";
import SettingsController from "../controllers/settingsController";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

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