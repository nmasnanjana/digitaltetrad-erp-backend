import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Expense from '../models/expense';
import logger from '../utils/logger';

class ExpenseController {
    // List all expenses
    static async getAllExpenses(req: Request, res: Response): Promise<any> {
        try {
            const {
                createdStartDate,
                createdEndDate,
                expenseTypeId,
                operations,
                jobId,
                operationTypeId,
                status
            } = req.query;

            const where: any = {};

            // Handle date filters
            if (createdStartDate || createdEndDate) {
                where.createdAt = {};
                if (createdStartDate) {
                    const startDate = new Date(createdStartDate as string);
                    startDate.setHours(0, 0, 0, 0);
                    where.createdAt[Op.gte] = startDate;
                }
                if (createdEndDate) {
                    const endDate = new Date(createdEndDate as string);
                    endDate.setHours(23, 59, 59, 999);
                    where.createdAt[Op.lte] = endDate;
                }
            }

            // Handle expense type filter
            if (expenseTypeId) {
                where.expenses_type_id = expenseTypeId;
            }

            // Handle category filter (job/operation)
            if (operations !== undefined) {
                where.operations = operations === 'true';
            }

            // Handle job filter
            if (jobId) {
                where.job_id = jobId;
            }

            // Handle operation type filter
            if (operationTypeId) {
                where.operation_type_id = operationTypeId;
            }

            // Handle status filter
            if (status) {
                where.status = status;
            }

            const expenses = await Expense.findAll({
                where,
                include: [
                    { model: Expense.sequelize?.models.ExpenseType, as: 'expenseType' },
                    { model: Expense.sequelize?.models.OperationType, as: 'operationType' },
                    { model: Expense.sequelize?.models.Job, as: 'job' },
                    { model: Expense.sequelize?.models.User, as: 'editor' },
                    { model: Expense.sequelize?.models.User, as: 'reviewer' }
                ]
            });
            return res.status(200).json(expenses);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while fetching expenses';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get single expense by ID
    static async getExpenseById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const expense = await Expense.findByPk(id, {
                include: [
                    { model: Expense.sequelize?.models.ExpenseType, as: 'expenseType' },
                    { model: Expense.sequelize?.models.OperationType, as: 'operationType' },
                    { model: Expense.sequelize?.models.Job, as: 'job' },
                    { model: Expense.sequelize?.models.User, as: 'editor' },
                    { model: Expense.sequelize?.models.User, as: 'reviewer' }
                ]
            });

            if (!expense) {
                return res.status(404).send({ error: 'Expense not found' });
            }
            return res.status(200).json(expense);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while fetching the expense';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Create new expense
    static async createExpense(req: Request, res: Response): Promise<any> {
        try {
            const { expenses_type_id, operations, operation_type_id, job_id, description, amount } = req.body;

            // Validate required fields
            if (!expenses_type_id || !description || amount === undefined) {
                return res.status(400).send({ error: 'Required fields are missing' });
            }

            // Validate operation_type_id requirement based on operations
            if (operations && !operation_type_id) {
                return res.status(400).send({ error: 'Operation Type ID is required when operations is true' });
            }

            // Validate job_id requirement based on operations
            if (!operations && !job_id) {
                return res.status(400).send({ error: 'Job ID is required when operations is false' });
            }

            const newExpense = await Expense.create({
                expenses_type_id,
                operations,
                operation_type_id: operations ? operation_type_id : null,
                job_id: operations ? null : job_id,
                description,
                amount,
                status: !operations ? 'on_progress' : null // Set status to on_progress for job-related expenses
            });

            logger.info(`New expense created with ID: ${newExpense.id}`);
            return res.status(201).json(newExpense);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while creating the expense';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Edit expense
    static async updateExpense(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { expenses_type_id, operations, operation_type_id, job_id, description, amount, edited_by, reason_to_edit } = req.body;

            const expense = await Expense.findByPk(id);
            if (!expense) {
                return res.status(404).send({ error: 'Expense not found' });
            }

            // Check if expense is approved
            if (expense.status === 'approved') {
                return res.status(400).send({ error: 'Cannot edit an approved expense' });
            }

            // Validate required fields
            if (!expenses_type_id || !description || amount === undefined || !edited_by || !reason_to_edit) {
                return res.status(400).send({ error: 'Required fields are missing' });
            }

            // Validate operation_type_id requirement based on operations
            if (operations && !operation_type_id) {
                return res.status(400).send({ error: 'Operation Type ID is required when operations is true' });
            }

            // Validate job_id requirement based on operations
            if (!operations && !job_id) {
                return res.status(400).send({ error: 'Job ID is required when operations is false' });
            }

            // Reset status to on_progress if expense was denied
            const newStatus = expense.status === 'denied' ? 'on_progress' : expense.status;

            await expense.update({
                expenses_type_id,
                operations,
                operation_type_id: operations ? operation_type_id : null,
                job_id: operations ? null : job_id,
                description,
                amount,
                edited_by,
                reason_to_edit,
                status: newStatus
            });

            // Fetch the updated expense with all associations
            const updatedExpense = await Expense.findByPk(id, {
                include: [
                    { model: Expense.sequelize?.models.ExpenseType, as: 'expenseType' },
                    { model: Expense.sequelize?.models.OperationType, as: 'operationType' },
                    { model: Expense.sequelize?.models.Job, as: 'job' },
                    { model: Expense.sequelize?.models.User, as: 'editor' },
                    { model: Expense.sequelize?.models.User, as: 'reviewer' }
                ]
            });

            logger.info(`Expense ${id} updated successfully`);
            return res.status(200).json(updatedExpense);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while updating the expense';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Delete expense
    static async deleteExpense(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const expense = await Expense.findByPk(id);

            if (!expense) {
                return res.status(404).send({ error: 'Expense not found' });
            }

            // Prevent deletion of approved expenses
            if (expense.status === 'approved') {
                return res.status(400).send({ error: 'Cannot delete an approved expense' });
            }

            await expense.destroy();
            logger.info(`Expense ${id} deleted successfully`);
            return res.status(200).send({ info: 'Expense deleted successfully' });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while deleting the expense';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get expenses by job ID
    static async getExpensesByJob(req: Request, res: Response): Promise<any> {
        try {
            const { jobId } = req.params;
            const expenses = await Expense.findAll({
                where: { job_id: jobId },
                include: [
                    { model: Expense.sequelize?.models.ExpenseType, as: 'expenseType' },
                    { model: Expense.sequelize?.models.OperationType, as: 'operationType' },
                    { model: Expense.sequelize?.models.Job, as: 'job' },
                    { model: Expense.sequelize?.models.User, as: 'editor' },
                    { model: Expense.sequelize?.models.User, as: 'reviewer' }
                ]
            });
            return res.status(200).json(expenses);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while fetching expenses for the job';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Review expense
    static async reviewExpense(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { status, reviewer_comment, reviewed_by } = req.body;

            if (!status || !reviewed_by) {
                return res.status(400).send({ error: 'Status and reviewer are required' });
            }

            const expense = await Expense.findByPk(id);
            if (!expense) {
                return res.status(404).send({ error: 'Expense not found' });
            }

            // Only job-related expenses can be reviewed
            if (expense.operations) {
                return res.status(400).send({ error: 'Only job-related expenses can be reviewed' });
            }

            await expense.update({
                status,
                reviewer_comment,
                reviewed_by,
                reviewed_at: new Date()
            });

            const updatedExpense = await Expense.findByPk(id, {
                include: [
                    { model: Expense.sequelize?.models.ExpenseType, as: 'expenseType' },
                    { model: Expense.sequelize?.models.OperationType, as: 'operationType' },
                    { model: Expense.sequelize?.models.Job, as: 'job' },
                    { model: Expense.sequelize?.models.User, as: 'editor' },
                    { model: Expense.sequelize?.models.User, as: 'reviewer' }
                ]
            });

            logger.info(`Expense ${id} reviewed with status: ${status}`);
            return res.status(200).json(updatedExpense);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while reviewing the expense';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Update expense payment status
    static async updatePaymentStatus(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { paid } = req.body;

            const expense = await Expense.findByPk(id);
            if (!expense) {
                return res.status(404).send({ error: 'Expense not found' });
            }

            // Only approved expenses can be marked as paid
            if (expense.status !== 'approved') {
                return res.status(400).send({ error: 'Only approved expenses can be marked as paid' });
            }

            await expense.update({ paid });

            const updatedExpense = await Expense.findByPk(id, {
                include: [
                    { model: Expense.sequelize?.models.ExpenseType, as: 'expenseType' },
                    { model: Expense.sequelize?.models.OperationType, as: 'operationType' },
                    { model: Expense.sequelize?.models.Job, as: 'job' },
                    { model: Expense.sequelize?.models.User, as: 'editor' },
                    { model: Expense.sequelize?.models.User, as: 'reviewer' }
                ]
            });

            logger.info(`Expense ${id} payment status updated to: ${paid}`);
            return res.status(200).json(updatedExpense);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while updating payment status';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }
}

export default ExpenseController; 