import express from "express";
import ExpenseTypeController from "../controllers/expenseTypeController";

const router = express.Router();

// Expense type routes
router.post("/", ExpenseTypeController.createExpenseType); // Create a new expense type
router.get("/", ExpenseTypeController.getAllExpenseTypes); // Get all expense types
router.get("/:id", ExpenseTypeController.getExpenseTypeById); // Get expense type by ID
router.put("/:id", ExpenseTypeController.updateExpenseType); // Update expense type
router.delete("/:id", ExpenseTypeController.deleteExpenseType); // Delete expense type

export default router; 