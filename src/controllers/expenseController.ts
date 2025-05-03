import { Request, Response } from "express";
import { Op } from 'sequelize';
import Expense from "../models/expense";
import ExpenseType from "../models/expenseType";
import Job from "../models/job";
import User from "../models/user";
import logger from "../utils/logger";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}

class ExpenseController {
    // Create a new expense
    static async createExpense(req: Request, res: Response): Promise<any> {
        try {
            const { expenses_type_id, operations, job_id, description, amount } = req.body;
            const edited_by = req.user?.id; // Assuming user ID is available in req.user

            if (!expenses_type_id || !description || !amount || !edited_by) {
                const msg = "Required fields are missing";
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            // Validate that either operations is true or job_id is provided, but not both
            if (operations && job_id) {
                const msg = "Expense cannot be both an operation and associated with a job";
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            if (!operations && !job_id) {
                const msg = "Expense must be either an operation or associated with a job";
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            const expense = await Expense.create({
                expenses_type_id,
                operations,
                job_id,
                description,
                amount,
                edited_by,
            });

            const msg = `Expense created successfully`;
            logger.info(msg);
            return res.status(201).send({ info: msg, expense });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while creating the expense";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get all expenses with filters
    static async getAllExpenses(req: Request, res: Response): Promise<any> {
        try {
            const {
                startDate,
                endDate,
                operations,
                job_id,
                expenses_type_id,
            } = req.query;

            const where: any = {};

            // Date range filter
            if (startDate && endDate) {
                where.createdAt = {
                    [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
                };
            }

            // Operations filter
            if (operations !== undefined) {
                where.operations = operations === 'true';
            }

            // Job filter
            if (job_id) {
                where.job_id = job_id;
            }

            // Expense type filter
            if (expenses_type_id) {
                where.expenses_type_id = expenses_type_id;
            }

            const expenses = await Expense.findAll({
                where,
                include: [
                    { model: ExpenseType, as: 'expenseType' },
                    { model: Job, as: 'job' },
                    { model: User, as: 'editor' },
                ],
                order: [['createdAt', 'DESC']],
            });

            return res.status(200).json(expenses);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while fetching expenses";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get expense by ID
    static async getExpenseById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const expense = await Expense.findByPk(id, {
                include: [
                    { model: ExpenseType, as: 'expenseType' },
                    { model: Job, as: 'job' },
                    { model: User, as: 'editor' },
                ],
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
                const msg = "An unknown server error occurred while fetching the expense";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Update expense
    static async updateExpense(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { expenses_type_id, operations, job_id, description, amount } = req.body;
            const edited_by = req.user?.id; // Assuming user ID is available in req.user

            const expense = await Expense.findByPk(id);
            if (!expense) {
                return res.status(404).send({ error: 'Expense not found' });
            }

            // Validate that either operations is true or job_id is provided, but not both
            if (operations && job_id) {
                const msg = "Expense cannot be both an operation and associated with a job";
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            await expense.update({
                expenses_type_id,
                operations,
                job_id,
                description,
                amount,
                edited_by,
            });

            const msg = `Expense updated successfully`;
            logger.info(msg);
            return res.status(200).send({ info: msg, expense });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while updating the expense";
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
            const msg = `Expense deleted successfully`;
            logger.info(msg);
            return res.status(200).send({ info: msg });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while deleting the expense";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }
}

export default ExpenseController; 