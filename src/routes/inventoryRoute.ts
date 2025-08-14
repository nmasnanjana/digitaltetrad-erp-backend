import express from "express";
import InventoryController from "../controllers/inventoryController";

const router = express.Router();

// Inventory routes
router.post("/", InventoryController.createInventory); // Create a new inventory item
router.get("/", InventoryController.getAllInventory); // Get all inventory items
router.get("/:id", InventoryController.getInventoryById); // Get inventory item by ID
router.put("/:id", InventoryController.updateInventory); // Update inventory item
router.delete("/:id", InventoryController.deleteInventory); // Delete inventory item
router.get("/job/:jobId", InventoryController.getInventoryByJobId); // Get inventory items by job ID
router.get("/returns", InventoryController.getReturnItems); // Get return items

export default router; 