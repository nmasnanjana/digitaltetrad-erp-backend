import {Request, Response} from "express";
import Customer from "../models/customer";
import logger from "../utils/logger";

class CustomerController {
    // Create a new customer
    static async createCustomer(req: Request, res: Response): Promise<any> {
        try {
            const { name } = req.body;

            // Validate required fields
            if (!name) {
                const msg = "Name is a required field";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const newCustomer = await Customer.create({
                name
            });

            const msg = `New customer created - ${newCustomer.name}`;
            logger.info(msg);
            return res.status(201).send({info: msg, customer: newCustomer});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while creating the customer';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get all customers
    static async getAllCustomers(req: Request, res: Response): Promise<any> {
        try {
            const customers = await Customer.findAll();
            return res.status(200).json(customers);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while fetching customers";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get customer by ID
    static async getCustomerById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const customer = await Customer.findByPk(id);

            if (!customer) {
                return res.status(404).send({error: 'Customer not found'});
            }
            return res.status(200).json(customer);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while fetching the customer";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Update customer
    static async updateCustomer(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { name } = req.body;

            const customer = await Customer.findByPk(id);
            if (!customer) {
                return res.status(404).send({error: 'Customer not found'});
            }

            await customer.update({
                name
            });

            const msg = `Customer ${customer.name} updated successfully`;
            logger.info(msg);
            return res.status(200).send({info: msg, customer});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while updating the customer";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete customer
    static async deleteCustomer(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const customer = await Customer.findByPk(id);

            if (!customer) {
                return res.status(404).send({error: 'Customer not found'});
            }

            await customer.destroy();
            const msg = `Customer ${customer.name} deleted successfully`;
            logger.info(msg);
            return res.status(200).send({info: msg});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while deleting the customer";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

export default CustomerController; 