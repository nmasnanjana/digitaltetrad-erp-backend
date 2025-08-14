import { Request, Response } from "express";
import ExpenseType from "../models/expenseType";
import logger from "../utils/logger";

class ExpenseTypeController {
    // Create a new expense type
    static async createExpenseType(req: Request, res: Response): Promise<any> {
        try {
            const { name, description } = req.body;

            if (!name) {
                const msg = "Expense type name is required";
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            const expenseType = await ExpenseType.create({
                name,
                description,
            });

            const msg = `Expense type ${expenseType.name} created successfully`;
            logger.info(msg);
            return res.status(201).send({ info: msg, expenseType });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while creating the expense type";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get all expense types
    static async getAllExpenseTypes(req: Request, res: Response): Promise<any> {
        try {
            const expenseTypes = await ExpenseType.findAll({
                order: [['name', 'ASC']],
            });

            return res.status(200).json(expenseTypes);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while fetching expense types";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get expense type by ID
    static async getExpenseTypeById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const expenseType = await ExpenseType.findByPk(id);

            if (!expenseType) {
                return res.status(404).send({ error: 'Expense type not found' });
            }

            return res.status(200).json(expenseType);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while fetching the expense type";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Update expense type
    static async updateExpenseType(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { name, description, isActive } = req.body;

            const expenseType = await ExpenseType.findByPk(id);
            if (!expenseType) {
                return res.status(404).send({ error: 'Expense type not found' });
            }

            await expenseType.update({
                name,
                description,
                isActive,
            });

            const msg = `Expense type ${expenseType.name} updated successfully`;
            logger.info(msg);
            return res.status(200).send({ info: msg, expenseType });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while updating the expense type";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Delete expense type
    static async deleteExpenseType(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const expenseType = await ExpenseType.findByPk(id);

            if (!expenseType) {
                return res.status(404).send({ error: 'Expense type not found' });
            }

            await expenseType.destroy();
            const msg = `Expense type ${expenseType.name} deleted successfully`;
            logger.info(msg);
            return res.status(200).send({ info: msg });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while deleting the expense type";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }
}

export default ExpenseTypeController; 