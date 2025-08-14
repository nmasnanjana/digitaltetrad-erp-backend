import express from "express";
import ExpenseController from "../controllers/expenseController";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

// Expense routes
router.get("/", checkPermission('expense', 'read'), ExpenseController.getAllExpenses); // Get all expenses with their related data
router.get("/job/:jobId", checkPermission('expense', 'read'), ExpenseController.getExpensesByJob);
router.get("/:id", checkPermission('expense', 'read'), ExpenseController.getExpenseById); // Get a single expense by ID with all related data
router.post("/", checkPermission('expense', 'create'), ExpenseController.createExpense); // Create a new expense (requires expense_type_id, operations, description, amount, and job_id if operations is false)
router.put("/:id", checkPermission('expense', 'update'), ExpenseController.updateExpense); // Update an existing expense (requires all fields including edited_by and reason_to_edit)
router.delete("/:id", checkPermission('expense', 'delete'), ExpenseController.deleteExpense); // Delete an expense by ID

// New routes for expense approval process
router.post("/:id/review", checkPermission('expense', 'reviewexpense'), ExpenseController.reviewExpense); // Review an expense (requires status, reviewer_comment, and reviewed_by)
router.put("/:id/payment", checkPermission('expense', 'update'), ExpenseController.updatePaymentStatus); // Update payment status (requires paid field)

export default router; 