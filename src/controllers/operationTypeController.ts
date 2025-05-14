import { Request, Response } from "express";
import OperationType from "../models/operationType";
import logger from "../utils/logger";

class OperationTypeController {
    // Create a new operation type
    static async createOperationType(req: Request, res: Response): Promise<any> {
        try {
            const { name, description } = req.body;

            if (!name) {
                const msg = "Operation type name is required";
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            const operationType = await OperationType.create({
                name,
                description,
            });

            const msg = `Operation type ${operationType.name} created successfully`;
            logger.info(msg);
            return res.status(201).send({ info: msg, operationType });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while creating the operation type";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get all operation types
    static async getAllOperationTypes(req: Request, res: Response): Promise<any> {
        try {
            const operationTypes = await OperationType.findAll({
                order: [['name', 'ASC']],
            });

            return res.status(200).json(operationTypes);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while fetching operation types";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get operation type by ID
    static async getOperationTypeById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const operationType = await OperationType.findByPk(id);

            if (!operationType) {
                return res.status(404).send({ error: 'Operation type not found' });
            }

            return res.status(200).json(operationType);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while fetching the operation type";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Update operation type
    static async updateOperationType(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { name, description, isActive } = req.body;

            const operationType = await OperationType.findByPk(id);
            if (!operationType) {
                return res.status(404).send({ error: 'Operation type not found' });
            }

            await operationType.update({
                name,
                description,
                isActive,
            });

            const msg = `Operation type ${operationType.name} updated successfully`;
            logger.info(msg);
            return res.status(200).send({ info: msg, operationType });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while updating the operation type";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Delete operation type
    static async deleteOperationType(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const operationType = await OperationType.findByPk(id);

            if (!operationType) {
                return res.status(404).send({ error: 'Operation type not found' });
            }

            await operationType.destroy();
            const msg = `Operation type ${operationType.name} deleted successfully`;
            logger.info(msg);
            return res.status(200).send({ info: msg });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown server error occurred while deleting the operation type";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }
}

export default OperationTypeController; 