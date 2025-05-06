import { Request, Response } from 'express';
import Expense from '../models/expense';
import logger from '../utils/logger';

class ExpenseController {
    // List all expenses
    static async getAllExpenses(req: Request, res: Response): Promise<any> {
        try {
            const expenses = await Expense.findAll({
                include: [
                    { model: Expense.sequelize?.models.ExpenseType, as: 'expenseType' },
                    { model: Expense.sequelize?.models.Job, as: 'job' },
                    { model: Expense.sequelize?.models.User, as: 'editor' }
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
                    { model: Expense.sequelize?.models.Job, as: 'job' },
                    { model: Expense.sequelize?.models.User, as: 'editor' }
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
            const { expense_type_id, operations, job_id, description, amount } = req.body;

            // Validate required fields
            if (!expense_type_id || !description || amount === undefined) {
                return res.status(400).send({ error: 'Required fields are missing' });
            }

            // Validate job_id requirement based on operations
            if (!operations && !job_id) {
                return res.status(400).send({ error: 'Job ID is required when operations is false' });
            }

            const newExpense = await Expense.create({
                expense_type_id,
                operations,
                job_id: operations ? null : job_id,
                description,
                amount
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
            const { expense_type_id, operations, job_id, description, amount, edited_by, reason_to_edit } = req.body;

            const expense = await Expense.findByPk(id);
            if (!expense) {
                return res.status(404).send({ error: 'Expense not found' });
            }

            // Validate required fields
            if (!expense_type_id || !description || amount === undefined || !edited_by || !reason_to_edit) {
                return res.status(400).send({ error: 'Required fields are missing' });
            }

            // Validate job_id requirement based on operations
            if (!operations && !job_id) {
                return res.status(400).send({ error: 'Job ID is required when operations is false' });
            }

            await expense.update({
                expense_type_id,
                operations,
                job_id: operations ? null : job_id,
                description,
                amount,
                edited_by,
                reason_to_edit
            });

            logger.info(`Expense ${id} updated successfully`);
            return res.status(200).json(expense);
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
}

export default ExpenseController; 