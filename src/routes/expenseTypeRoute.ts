import express from "express";
import ExpenseTypeController from "../controllers/expenseTypeController";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

// Expense type routes
router.post("/", checkPermission('expensetype', 'create'), ExpenseTypeController.createExpenseType); // Create a new expense type
router.get("/", checkPermission('expensetype', 'read'), ExpenseTypeController.getAllExpenseTypes); // Get all expense types
router.get("/:id", checkPermission('expensetype', 'read'), ExpenseTypeController.getExpenseTypeById); // Get expense type by ID
router.put("/:id", checkPermission('expensetype', 'update'), ExpenseTypeController.updateExpenseType); // Update expense type
router.delete("/:id", checkPermission('expensetype', 'delete'), ExpenseTypeController.deleteExpenseType); // Delete expense type

export default router; 