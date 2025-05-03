import express from "express";
import ExpenseController from "../controllers/expenseController";

const router = express.Router();

// Expense routes
router.post("/", ExpenseController.createExpense); // Create a new expense
router.get("/", ExpenseController.getAllExpenses); // Get all expenses with filters
router.get("/:id", ExpenseController.getExpenseById); // Get expense by ID
router.put("/:id", ExpenseController.updateExpense); // Update expense
router.delete("/:id", ExpenseController.deleteExpense); // Delete expense

export default router; 