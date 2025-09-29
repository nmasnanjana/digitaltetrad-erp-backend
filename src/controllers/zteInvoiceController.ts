import {Request, Response} from "express";
import ZteInvoice from "../models/zteInvoice";
import ZtePo from "../models/ztePo";
import Job from "../models/job";
import Customer from "../models/customer";
import { Op, QueryTypes } from "sequelize";
import sequelize from "../config/dbConfig";
import logger from "../utils/logger";

class ZteInvoiceController {
    // Create invoice records
    static async createInvoice(req: Request, res: Response): Promise<any> {
        
            const { invoice_no, invoice_data, vat_percentage } = req.body;

            if (!invoice_no || !invoice_data || !Array.isArray(invoice_data)) {
                const msg = "invoice_no and invoice_data array are required";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            if (vat_percentage === undefined || vat_percentage < 0 || vat_percentage > 100) {
                const msg = "vat_percentage is required and must be between 0 and 100";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const createdInvoices = [];
            const errors = [];

            for (const item of invoice_data) {
                const { zte_po_id } = item;

                if (!zte_po_id) {
                    errors.push(`Missing required fields for item: ${JSON.stringify(item)}`);
                    continue;
                }

                try {
                    // Find the ZTE PO record
                    const ztePo = await ZtePo.findByPk(zte_po_id);
                    if (!ztePo) {
                        errors.push(`ZTE PO not found for ID: ${zte_po_id}`);
                        continue;
                    }

                    // Check if already invoiced
                    if (ztePo.is_invoiced) {
                        errors.push(`PO ${ztePo.po_line_no}, Line ${ztePo.item_code} has already been invoiced`);
                        continue;
                    }

                    // Calculate amounts (100% billing)
                    const unitPriceStr = ztePo.unit_price;
                    const unitPrice = typeof unitPriceStr === 'string' ? parseFloat(unitPriceStr) : 
                                     typeof unitPriceStr === 'number' ? unitPriceStr : 0;
                    const subtotal_amount = unitPrice; // 100% of unit price
                    const vat_amount = subtotal_amount * vat_percentage / 100;
                    const total_amount = subtotal_amount + vat_amount;

                    // Create invoice record with VAT information
                    const invoice = await ZteInvoice.create({
                        invoice_no,
                        zte_po_id,
                        vat_percentage,
                        vat_amount,
                        subtotal_amount,
                        total_amount
                    });

                    // Mark the PO as invoiced
                    logger.info(`Marking ZTE PO ${ztePo.po_line_no}, Item ${ztePo.item_code} as invoiced`, {
                        po_id: ztePo.id,
                        invoice_no: invoice_no,
                        vat_percentage: vat_percentage,
                        subtotal_amount: subtotal_amount,
                        vat_amount: vat_amount,
                        total_amount: total_amount
                    });
                    
                    await ztePo.update({ is_invoiced: true });

                    createdInvoices.push(invoice);
                } catch (error) {
                    logger.error(`Error creating invoice for ZTE PO ${zte_po_id}:`, error);
                    errors.push(`Error creating invoice for ZTE PO ${zte_po_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            if (createdInvoices.length === 0) {
                const msg = "No invoices were created due to errors";
                logger.warn(msg);
                return res.status(400).send({error: msg, details: errors});
            }

            const msg = `Created ${createdInvoices.length} invoice records for invoice ${invoice_no}`;
            logger.info(msg);

            return res.status(201).send({
                success: true,
                message: msg,
                created_invoices: createdInvoices.length,
                errors: errors.length > 0 ? errors : undefined
            });
    }

    // Get all invoices with pagination
    static async getAllInvoices(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await ZteInvoice.findAndCountAll({
                include: [
                    {
                        model: ZtePo,
                        as: 'ztePo',
                        include: [
                            {
                                model: Job,
                                as: 'job',
                                include: [
                                    {
                                        model: Customer,
                                        as: 'customer'
                                    }
                                ]
                            }
                        ]
                    }
                ],
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            logger.error('Error fetching ZTE invoices:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching invoices',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get invoice by ID
    static async getInvoiceById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const invoice = await ZteInvoice.findByPk(id, {
                include: [
                    {
                        model: ZtePo,
                        as: 'ztePo',
                        include: [
                            {
                                model: Job,
                                as: 'job',
                                include: [
                                    {
                                        model: Customer,
                                        as: 'customer'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!invoice) {
                res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
                return;
            }

            res.json({
                success: true,
                data: invoice
            });
        } catch (error) {
            logger.error('Error fetching ZTE invoice:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching invoice',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get invoices by invoice number
    static async getInvoicesByInvoiceNumber(req: Request, res: Response): Promise<void> {
        try {
            const { invoice_no } = req.params;
            const invoices = await ZteInvoice.findAll({
                where: { invoice_no },
                include: [
                    {
                        model: ZtePo,
                        as: 'ztePo',
                        include: [
                            {
                                model: Job,
                                as: 'job',
                                include: [
                                    {
                                        model: Customer,
                                        as: 'customer'
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                data: invoices
            });
        } catch (error) {
            logger.error('Error fetching ZTE invoices by invoice number:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching invoices',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Delete invoice by ID
    static async deleteInvoice(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const invoice = await ZteInvoice.findByPk(id, {
                include: [
                    {
                        model: ZtePo,
                        as: 'ztePo'
                    }
                ]
            });

            if (!invoice) {
                res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
                return;
            }

            // Mark the PO as not invoiced
            const ztePo = (invoice as any).ztePo;
            if (ztePo) {
                await ztePo.update({ is_invoiced: false });
                
                logger.info(`Marked ZTE PO ${ztePo.po_line_no} as not invoiced after deleting invoice ${invoice.invoice_no}`);
            }

            await invoice.destroy();

            res.json({
                success: true,
                message: 'Invoice deleted successfully'
            });
        } catch (error) {
            logger.error('Error deleting ZTE invoice:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting invoice',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get invoice summary by invoice number
    static async getInvoiceSummary(req: Request, res: Response): Promise<void> {
        try {
            const { invoice_no } = req.params;
            
            const summary = await ZteInvoice.findAll({
                where: { invoice_no },
                include: [
                    {
                        model: ZtePo,
                        as: 'ztePo',
                        include: [
                            {
                                model: Job,
                                as: 'job',
                                include: [
                                    {
                                        model: Customer,
                                        as: 'customer'
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            if (summary.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
                return;
            }

            // Calculate totals
            const totals = summary.reduce((acc, invoice) => {
                acc.subtotal += invoice.subtotal_amount;
                acc.vat += invoice.vat_amount;
                acc.total += invoice.total_amount;
                return acc;
            }, { subtotal: 0, vat: 0, total: 0 });

            res.json({
                success: true,
                data: {
                    invoice_no,
                    summary,
                    totals,
                    count: summary.length
                }
            });
        } catch (error) {
            logger.error('Error fetching ZTE invoice summary:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching invoice summary',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

export default ZteInvoiceController;

