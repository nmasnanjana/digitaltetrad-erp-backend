import {Request, Response} from "express";
import HuaweiInvoice from "../models/huaweiInvoice";
import HuaweiPo from "../models/huaweiPo";
import Job from "../models/job";
import { Op } from "sequelize";
import logger from "../utils/logger";

class HuaweiInvoiceController {
    // Create invoice records
    static async createInvoice(req: Request, res: Response): Promise<any> {
        try {
            const { invoice_no, invoice_data } = req.body;

            if (!invoice_no || !invoice_data || !Array.isArray(invoice_data)) {
                const msg = "invoice_no and invoice_data array are required";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const createdInvoices = [];
            const errors = [];

            for (const item of invoice_data) {
                const { huawei_po_id, invoiced_percentage } = item;

                if (!huawei_po_id || invoiced_percentage === undefined) {
                    errors.push(`Missing required fields for PO ID: ${huawei_po_id}`);
                    continue;
                }

                // Check if PO exists
                const huaweiPo = await HuaweiPo.findByPk(huawei_po_id);
                if (!huaweiPo) {
                    errors.push(`Huawei PO with ID ${huawei_po_id} not found`);
                    continue;
                }

                // Validate percentage
                if (invoiced_percentage < 0 || invoiced_percentage > 100) {
                    errors.push(`Invalid percentage ${invoiced_percentage}% for PO ${huaweiPo.po_no}, Line ${huaweiPo.line_no}`);
                    continue;
                }

                // Check if total invoiced percentage would exceed 100%
                const currentInvoicedStr = huaweiPo.invoiced_percentage;
                const currentInvoiced = typeof currentInvoicedStr === 'string' ? parseFloat(currentInvoicedStr) : 
                                       typeof currentInvoicedStr === 'number' ? currentInvoicedStr : 0;
                const newTotalInvoiced = currentInvoiced + invoiced_percentage;
                
                if (newTotalInvoiced > 100) {
                    errors.push(`Cannot invoice ${invoiced_percentage}% for PO ${huaweiPo.po_no}, Line ${huaweiPo.line_no}. Already invoiced ${currentInvoiced}%, total would exceed 100% (${newTotalInvoiced}%)`);
                    continue;
                }

                // Create invoice record
                const invoice = await HuaweiInvoice.create({
                    invoice_no,
                    huawei_po_id,
                    invoiced_percentage
                });

                // Update the PO's invoiced_percentage - handle decimal string conversion
                console.log(`Updating PO ${huaweiPo.po_no}, Line ${huaweiPo.line_no}:`, {
                    current_invoiced: currentInvoicedStr,
                    current_invoiced_parsed: currentInvoiced,
                    new_invoice_percentage: invoiced_percentage,
                    new_total_invoiced: newTotalInvoiced
                });
                
                await huaweiPo.update({ invoiced_percentage: newTotalInvoiced });

                createdInvoices.push(invoice);
            }

            if (createdInvoices.length === 0) {
                const msg = "No invoices were created due to errors";
                logger.warn(msg);
                return res.status(400).send({error: msg, details: errors});
            }

            const msg = `Created ${createdInvoices.length} invoice records for invoice ${invoice_no}`;
            logger.info(msg);

            return res.status(201).send({
                info: msg,
                data: {
                    created_invoices: createdInvoices.length,
                    invoice_no,
                    errors: errors.length > 0 ? errors : undefined
                }
            });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown Server error occurred while creating the invoice';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get all invoices
    static async getAllInvoices(req: Request, res: Response): Promise<any> {
        try {
            const invoices = await HuaweiInvoice.findAll({
                include: [
                    {
                        model: HuaweiPo,
                        as: 'huaweiPo',
                        attributes: ['id', 'po_no', 'line_no', 'item_code', 'item_description', 'unit_price', 'requested_quantity', 'invoiced_percentage'],
                        include: [
                            {
                                model: Job,
                                as: 'job',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(invoices);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching the invoices";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get invoice summaries (unique invoice numbers with totals)
    static async getInvoiceSummaries(req: Request, res: Response): Promise<any> {
        try {
            const invoices = await HuaweiInvoice.findAll({
                include: [
                    {
                        model: HuaweiPo,
                        as: 'huaweiPo',
                        attributes: ['unit_price']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Group by invoice_no and calculate summaries
            const summaries = new Map();
            
            invoices.forEach(invoice => {
                const invoiceNo = invoice.invoice_no;
                const unitPrice = (invoice as any).huaweiPo?.unit_price || 0;
                const amount = unitPrice * invoice.invoiced_percentage / 100;
                
                if (summaries.has(invoiceNo)) {
                    const summary = summaries.get(invoiceNo);
                    summary.total_records += 1;
                    summary.total_amount += amount;
                } else {
                    summaries.set(invoiceNo, {
                        invoice_no: invoiceNo,
                        total_records: 1,
                        total_amount: amount,
                        created_at: (invoice as any).createdAt
                    });
                }
            });

            const summariesArray = Array.from(summaries.values());
            return res.status(200).json(summariesArray);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching invoice summaries";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get invoice by ID
    static async getInvoiceById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const invoice = await HuaweiInvoice.findByPk(id, {
                include: [
                    {
                        model: HuaweiPo,
                        as: 'huaweiPo',
                        attributes: ['id', 'po_no', 'line_no', 'item_code', 'item_description', 'unit_price', 'requested_quantity', 'invoiced_percentage'],
                        include: [
                            {
                                model: Job,
                                as: 'job',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            if (!invoice) return res.status(404).send({error: 'Invoice not found'});
            return res.status(200).json(invoice);

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching the invoice";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get invoices by invoice number
    static async getInvoicesByInvoiceNo(req: Request, res: Response): Promise<any> {
        try {
            const { invoice_no } = req.params;
            const invoices = await HuaweiInvoice.findAll({
                where: { invoice_no },
                include: [
                    {
                        model: HuaweiPo,
                        as: 'huaweiPo',
                        attributes: ['id', 'po_no', 'line_no', 'item_code', 'item_description', 'unit_price', 'requested_quantity', 'invoiced_percentage'],
                        include: [
                            {
                                model: Job,
                                as: 'job',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'ASC']]
            });

            if (invoices.length === 0) {
                return res.status(404).send({error: 'No invoices found with this invoice number'});
            }

            return res.status(200).json(invoices);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching invoices by invoice number";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Update invoice by ID
    static async updateInvoiceById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { invoice_no, invoiced_percentage } = req.body;

            const invoice = await HuaweiInvoice.findByPk(id);
            if (!invoice) return res.status(404).send({error: 'Invoice not found'});

            // Validate percentage if provided
            if (invoiced_percentage !== undefined && (invoiced_percentage < 0 || invoiced_percentage > 100)) {
                const msg = "invoiced_percentage must be between 0 and 100";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            await invoice.update({
                invoice_no: invoice_no || invoice.invoice_no,
                invoiced_percentage: invoiced_percentage !== undefined ? invoiced_percentage : invoice.invoiced_percentage
            });

            await invoice.save();
            const msg = `Invoice updated successfully - Invoice: ${invoice.invoice_no}`;
            logger.info(msg);
            return res.status(200).send({info: msg, data: invoice});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while trying to update the invoice";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete invoice by ID
    static async deleteInvoiceById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const invoice = await HuaweiInvoice.findByPk(id, {
                include: [
                    {
                        model: HuaweiPo,
                        as: 'huaweiPo'
                    }
                ]
            });

            if (!invoice) return res.status(404).send({error: 'Invoice not found'});
            
            const invoiceNo = invoice.invoice_no;
            const huaweiPo = (invoice as any).huaweiPo;
            
            // Reduce the PO's invoiced_percentage
            if (huaweiPo) {
                const currentInvoicedStr = huaweiPo.invoiced_percentage;
                const currentInvoiced = typeof currentInvoicedStr === 'string' ? parseFloat(currentInvoicedStr) : 
                                       typeof currentInvoicedStr === 'number' ? currentInvoicedStr : 0;
                const newTotalInvoiced = Math.max(0, currentInvoiced - invoice.invoiced_percentage);
                
                console.log(`Reducing PO ${huaweiPo.po_no}, Line ${huaweiPo.line_no}:`, {
                    current_invoiced: currentInvoicedStr,
                    current_invoiced_parsed: currentInvoiced,
                    invoice_percentage: invoice.invoiced_percentage,
                    new_total_invoiced: newTotalInvoiced
                });
                
                await huaweiPo.update({ invoiced_percentage: newTotalInvoiced });
            }
            
            await invoice.destroy();
            const msg = `Invoice deleted successfully - Invoice: ${invoiceNo}`;
            logger.info(msg);
            return res.status(200).send({info: msg});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while trying to delete the invoice";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete all invoices by invoice number
    static async deleteInvoicesByInvoiceNo(req: Request, res: Response): Promise<any> {
        try {
            const { invoice_no } = req.params;
            
            const invoices = await HuaweiInvoice.findAll({
                where: { invoice_no },
                include: [
                    {
                        model: HuaweiPo,
                        as: 'huaweiPo'
                    }
                ]
            });

            if (invoices.length === 0) {
                return res.status(404).send({error: 'No invoices found with this invoice number'});
            }

            let deletedCount = 0;
            
            // Delete each invoice and update PO percentages
            for (const invoice of invoices) {
                const huaweiPo = (invoice as any).huaweiPo;
                
                // Reduce the PO's invoiced_percentage
                if (huaweiPo) {
                    const currentInvoicedStr = huaweiPo.invoiced_percentage;
                    const currentInvoiced = typeof currentInvoicedStr === 'string' ? parseFloat(currentInvoicedStr) : 
                                           typeof currentInvoicedStr === 'number' ? currentInvoicedStr : 0;
                    const newTotalInvoiced = Math.max(0, currentInvoiced - invoice.invoiced_percentage);
                    
                    console.log(`Bulk delete - Reducing PO ${huaweiPo.po_no}, Line ${huaweiPo.line_no}:`, {
                        current_invoiced: currentInvoicedStr,
                        current_invoiced_parsed: currentInvoiced,
                        invoice_percentage: invoice.invoiced_percentage,
                        new_total_invoiced: newTotalInvoiced
                    });
                    
                    await huaweiPo.update({ invoiced_percentage: newTotalInvoiced });
                }
                
                await invoice.destroy();
                deletedCount++;
            }

            const msg = `Deleted ${deletedCount} invoice records for invoice ${invoice_no}`;
            logger.info(msg);
            return res.status(200).send({
                info: msg,
                data: { deleted_count: deletedCount }
            });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while trying to delete invoices";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

export default HuaweiInvoiceController; 