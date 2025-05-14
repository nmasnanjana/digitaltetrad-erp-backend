import express from "express";
import OperationTypeController from "../controllers/operationTypeController";

const router = express.Router();

// Operation type routes
router.post("/", OperationTypeController.createOperationType); // Create a new operation type
router.get("/", OperationTypeController.getAllOperationTypes); // Get all operation types
router.get("/:id", OperationTypeController.getOperationTypeById); // Get operation type by ID
router.put("/:id", OperationTypeController.updateOperationType); // Update operation type
router.delete("/:id", OperationTypeController.deleteOperationType); // Delete operation type

export default router; 