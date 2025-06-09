import { Request, Response } from 'express';
import Inventory, { ReturnCause } from '../models/inventory';
import Job from '../models/job';
import logger from '../utils/logger';

class InventoryController {
    // Create a new inventory item
    static async createInventory(req: Request, res: Response): Promise<any> {
        try {
            const {
                name,
                description,
                serialNumber,
                quantity,
                unitPrice,
                isReturnItem,
                returnCause,
                arStatus,
                mrnStatus,
                jobId
            } = req.body;

            // Validate required fields
            if (!name || !quantity || !unitPrice) {
                const msg = "Required fields missing: name, quantity, and unitPrice are required";
                logger.warn(msg);
                return res.status(400).json({ error: msg });
            }

            // Validate jobId if provided
            if (jobId) {
                const job = await Job.findByPk(jobId);
                if (!job) {
                    const msg = 'Invalid job ID';
                    logger.warn(msg);
                    return res.status(400).json({ error: msg });
                }
            }

            // Validate return item data
            if (isReturnItem && !returnCause) {
                const msg = 'Return cause is required for return items';
                logger.warn(msg);
                return res.status(400).json({ error: msg });
            }

            const inventory = await Inventory.create({
                name,
                description,
                serialNumber,
                quantity,
                unitPrice,
                isReturnItem,
                returnCause,
                arStatus,
                mrnStatus,
                jobId
            });

            logger.info(`New inventory item created: ${inventory.name}`);
            return res.status(201).json(inventory);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).json({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while creating inventory item';
                logger.error(msg);
                return res.status(500).json({ error: msg });
            }
        }
    }

    // Get all inventory items
    static async getAllInventory(req: Request, res: Response): Promise<any> {
        try {
            const inventory = await Inventory.findAll({
                include: [{
                    model: Job,
                    as: 'job',
                    attributes: ['id', 'name']
                }]
            });
            return res.status(200).json(inventory);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).json({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while fetching inventory items';
                logger.error(msg);
                return res.status(500).json({ error: msg });
            }
        }
    }

    // Get inventory item by ID
    static async getInventoryById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const inventory = await Inventory.findByPk(id, {
                include: [{
                    model: Job,
                    as: 'job',
                    attributes: ['id', 'name']
                }]
            });

            if (!inventory) {
                const msg = 'Inventory item not found';
                logger.warn(msg);
                return res.status(404).json({ error: msg });
            }

            return res.status(200).json(inventory);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).json({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while fetching inventory item';
                logger.error(msg);
                return res.status(500).json({ error: msg });
            }
        }
    }

    // Update inventory item
    static async updateInventory(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const {
                name,
                description,
                serialNumber,
                quantity,
                unitPrice,
                isReturnItem,
                returnCause,
                arStatus,
                mrnStatus,
                jobId,
                isReturnedToWarehouse
            } = req.body;

            const inventory = await Inventory.findByPk(id);
            if (!inventory) {
                const msg = 'Inventory item not found';
                logger.warn(msg);
                return res.status(404).json({ error: msg });
            }

            // Validate jobId if provided
            if (jobId) {
                const job = await Job.findByPk(jobId);
                if (!job) {
                    const msg = 'Invalid job ID';
                    logger.warn(msg);
                    return res.status(400).json({ error: msg });
                }
            }

            // Validate return item data
            if (isReturnItem && !returnCause) {
                const msg = 'Return cause is required for return items';
                logger.warn(msg);
                return res.status(400).json({ error: msg });
            }

            await inventory.update({
                name,
                description,
                serialNumber,
                quantity,
                unitPrice,
                isReturnItem,
                returnCause,
                arStatus,
                mrnStatus,
                jobId,
                isReturnedToWarehouse
            });

            logger.info(`Inventory item updated: ${inventory.name}`);
            return res.status(200).json(inventory);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).json({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while updating inventory item';
                logger.error(msg);
                return res.status(500).json({ error: msg });
            }
        }
    }

    // Delete inventory item
    static async deleteInventory(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const inventory = await Inventory.findByPk(id);

            if (!inventory) {
                const msg = 'Inventory item not found';
                logger.warn(msg);
                return res.status(404).json({ error: msg });
            }

            await inventory.destroy();
            logger.info(`Inventory item deleted: ${inventory.name}`);
            return res.status(200).json({ info: 'Inventory item deleted successfully' });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).json({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while deleting inventory item';
                logger.error(msg);
                return res.status(500).json({ error: msg });
            }
        }
    }

    // Get inventory items by job ID
    static async getInventoryByJobId(req: Request, res: Response): Promise<any> {
        try {
            const { jobId } = req.params;
            const inventory = await Inventory.findAll({
                where: { jobId },
                include: [{
                    model: Job,
                    attributes: ['id', 'name']
                }]
            });
            return res.status(200).json(inventory);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).json({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while fetching inventory items by job';
                logger.error(msg);
                return res.status(500).json({ error: msg });
            }
        }
    }

    // Get return items
    static async getReturnItems(req: Request, res: Response): Promise<any> {
        try {
            const inventory = await Inventory.findAll({
                where: { isReturnItem: true },
                include: [{
                    model: Job,
                    attributes: ['id', 'name']
                }]
            });
            return res.status(200).json(inventory);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).json({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while fetching return items';
                logger.error(msg);
                return res.status(500).json({ error: msg });
            }
        }
    }
}

export default InventoryController; 