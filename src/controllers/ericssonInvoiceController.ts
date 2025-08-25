import { Request, Response } from 'express';
import EricssonInvoice from '../models/ericssonInvoice';
import logger from '../utils/logger';

export class EricssonInvoiceController {
    static async createInvoice(req: Request, res: Response): Promise<void> {
        try {
            const {
                invoice_number,
                job_id,
                job_title,
                customer_name,
                customer_address,
                project,
                site_id,
                site_name,
                purchase_order_number,
                subtotal,
                vat_amount,
                ssl_amount,
                total_amount,
                vat_percentage,
                ssl_percentage,
                items
            } = req.body;

            logger.info(`Creating invoice with items count: ${items?.length || 0}`);
            logger.info(`Items data: ${JSON.stringify(items)}`);

            // Check if invoice number already exists
            const existingInvoice = await EricssonInvoice.findOne({
                where: { invoice_number }
            });

            if (existingInvoice) {
                res.status(400).json({
                    success: false,
                    message: 'Invoice number already exists'
                });
                return;
            }

            // Update invoiced percentages for BOQ items
            if (items && items.length > 0) {
                const EricssonBoqItem = require('../models/ericssonBoqItem').default;
                
                for (const item of items) {
                    if (item.id && item.need_to_invoice_percentage) {
                        const boqItem = await EricssonBoqItem.findByPk(item.id);
                        if (boqItem) {
                            const currentInvoiced = parseFloat(boqItem.invoiced_percentage) || 0;
                            const newInvoiced = currentInvoiced + parseFloat(item.need_to_invoice_percentage);
                            
                            if (newInvoiced > 100) {
                                res.status(400).json({
                                    success: false,
                                    message: `Cannot invoice ${item.need_to_invoice_percentage}% for item ${item.service_number}. Already invoiced ${currentInvoiced}%, total would exceed 100% (${newInvoiced}%)`
                                });
                                return;
                            }
                            
                            await boqItem.update({ invoiced_percentage: newInvoiced });
                            logger.info(`Updated invoiced percentage for item ${item.id} from ${currentInvoiced}% to ${newInvoiced}%`);
                        }
                    }
                }
            }

            // Create the invoice
            const invoice = await EricssonInvoice.create({
                invoice_number,
                job_id,
                job_title,
                customer_name,
                customer_address,
                project,
                site_id,
                site_name,
                purchase_order_number,
                subtotal,
                vat_amount,
                ssl_amount,
                total_amount,
                vat_percentage,
                ssl_percentage,
                items,
                created_by: (req as any).user?.id
            });

            logger.info(`Created Ericsson invoice: ${invoice_number} for job: ${job_id}`);

            res.status(201).json({
                success: true,
                message: 'Invoice created successfully',
                data: invoice
            });
        } catch (error) {
            logger.error('Error creating Ericsson invoice:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create invoice',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getAllInvoices(req: Request, res: Response): Promise<void> {
        try {
            const invoices = await EricssonInvoice.findAll({
                order: [['createdAt', 'DESC']]
            });

            res.status(200).json({
                success: true,
                data: invoices
            });
        } catch (error) {
            logger.error('Error fetching Ericsson invoices:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch invoices',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getInvoiceById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const invoice = await EricssonInvoice.findByPk(id);

            if (!invoice) {
                res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: invoice
            });
        } catch (error) {
            logger.error('Error fetching Ericsson invoice:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch invoice',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getInvoicesByJobId(req: Request, res: Response): Promise<void> {
        try {
            const { jobId } = req.params;
            const invoices = await EricssonInvoice.findAll({
                where: { job_id: jobId },
                order: [['createdAt', 'DESC']]
            });

            res.status(200).json({
                success: true,
                data: invoices
            });
        } catch (error) {
            logger.error('Error fetching Ericsson invoices by job ID:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch invoices',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async deleteInvoice(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const invoice = await EricssonInvoice.findByPk(id);

            if (!invoice) {
                res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
                return;
            }

            // Reduce invoiced percentages for BOQ items
            const invoiceData = invoice.toJSON();
            if (invoiceData.items && invoiceData.items.length > 0) {
                const EricssonBoqItem = require('../models/ericssonBoqItem').default;
                
                for (const item of invoiceData.items) {
                    if (item.id && item.need_to_invoice_percentage) {
                        const boqItem = await EricssonBoqItem.findByPk(item.id);
                        if (boqItem) {
                            const currentInvoiced = parseFloat(boqItem.invoiced_percentage) || 0;
                            const newInvoiced = Math.max(0, currentInvoiced - parseFloat(item.need_to_invoice_percentage));
                            
                            await boqItem.update({ invoiced_percentage: newInvoiced });
                            logger.info(`Reduced invoiced percentage for item ${item.id} from ${currentInvoiced}% to ${newInvoiced}%`);
                        }
                    }
                }
            }

            await invoice.destroy();

            logger.info(`Deleted Ericsson invoice: ${invoice.invoice_number}`);

            res.status(200).json({
                success: true,
                message: 'Invoice deleted successfully'
            });
        } catch (error) {
            logger.error('Error deleting Ericsson invoice:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete invoice',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 