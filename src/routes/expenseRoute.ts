import express from "express";
import ExpenseController from "../controllers/expenseController";

const router = express.Router();

// Expense routes
router.get("/", ExpenseController.getAllExpenses); // Get all expenses with their related data
router.get("/job/:jobId", ExpenseController.getExpensesByJob);
router.get("/:id", ExpenseController.getExpenseById); // Get a single expense by ID with all related data
router.post("/", ExpenseController.createExpense); // Create a new expense (requires expense_type_id, operations, description, amount, and job_id if operations is false)
router.put("/:id", ExpenseController.updateExpense); // Update an existing expense (requires all fields including edited_by and reason_to_edit)
router.delete("/:id", ExpenseController.deleteExpense); // Delete an expense by ID

export default router; 