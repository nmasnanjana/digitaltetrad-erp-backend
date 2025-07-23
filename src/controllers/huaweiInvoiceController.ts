import {Request, Response} from "express";
import HuaweiInvoice from "../models/huaweiInvoice";
import HuaweiPo from "../models/huaweiPo";
import logger from "../utils/logger";

class HuaweiInvoiceController {
    // Create a new Huawei invoice
    static async createHuaweiInvoice(req: Request, res: Response): Promise<any> {
        try {
            const { invoice_no, huawei_po_id, invoiced_percentage } = req.body;

            // Validate required fields
            if (!invoice_no || !huawei_po_id || invoiced_percentage === undefined) {
                const msg = "invoice_no, huawei_po_id, and invoiced_percentage are required";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Validate percentage range
            if (invoiced_percentage < 0 || invoiced_percentage > 100) {
                const msg = "invoiced_percentage must be between 0 and 100";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Check if Huawei PO exists
            const huaweiPo = await HuaweiPo.findByPk(huawei_po_id);
            if (!huaweiPo) {
                const msg = "Huawei PO not found";
                logger.warn(msg);
                return res.status(404).send({error: msg});
            }

            // Check if invoice already exists for this PO
            const existingInvoice = await HuaweiInvoice.findOne({
                where: { huawei_po_id }
            });

            if (existingInvoice) {
                const msg = "Invoice already exists for this Huawei PO";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const newHuaweiInvoice = await HuaweiInvoice.create({
                invoice_no,
                huawei_po_id,
                invoiced_percentage
            });

            const msg = `New Huawei invoice created - Invoice: ${newHuaweiInvoice.invoice_no}, PO: ${huaweiPo.po_no}`;
            logger.info(msg);
            return res.status(201).send({info: msg, data: newHuaweiInvoice});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown Server error occurred while creating the Huawei invoice';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get all Huawei invoices
    static async getAllHuaweiInvoices(req: Request, res: Response): Promise<any> {
        try {
            const huaweiInvoices = await HuaweiInvoice.findAll({
                include: [
                    {
                        model: HuaweiPo,
                        as: 'huaweiPo',
                        attributes: ['id', 'po_no', 'line_no', 'item_code', 'item_description', 'unit_price', 'requested_quantity']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(huaweiInvoices);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching the Huawei invoices";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get Huawei invoice by ID
    static async getHuaweiInvoiceByID(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const huaweiInvoice = await HuaweiInvoice.findByPk(id, {
                include: [
                    {
                        model: HuaweiPo,
                        as: 'huaweiPo',
                        attributes: ['id', 'po_no', 'line_no', 'item_code', 'item_description', 'unit_price', 'requested_quantity']
                    }
                ]
            });

            if (!huaweiInvoice) return res.status(404).send({error: 'Huawei invoice not found'});
            return res.status(200).json(huaweiInvoice);

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching the Huawei invoice";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get Huawei invoices by invoice number
    static async getHuaweiInvoicesByInvoiceNo(req: Request, res: Response): Promise<any> {
        try {
            const { invoice_no } = req.params;
            const huaweiInvoices = await HuaweiInvoice.findAll({
                where: { invoice_no },
                include: [
                    {
                        model: HuaweiPo,
                        as: 'huaweiPo',
                        attributes: ['id', 'po_no', 'line_no', 'item_code', 'item_description', 'unit_price', 'requested_quantity']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            if (huaweiInvoices.length === 0) {
                return res.status(404).send({error: 'No Huawei invoices found with this invoice number'});
            }

            return res.status(200).json(huaweiInvoices);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching the Huawei invoices by invoice number";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Update a Huawei invoice
    static async updateHuaweiInvoiceByID(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { invoice_no, invoiced_percentage } = req.body;

            const huaweiInvoice = await HuaweiInvoice.findByPk(id);
            if (!huaweiInvoice) return res.status(404).send({error: 'Huawei invoice not found'});

            // Validate percentage range if provided
            if (invoiced_percentage !== undefined && (invoiced_percentage < 0 || invoiced_percentage > 100)) {
                const msg = "invoiced_percentage must be between 0 and 100";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            await huaweiInvoice.update({
                invoice_no: invoice_no || huaweiInvoice.invoice_no,
                invoiced_percentage: invoiced_percentage !== undefined ? invoiced_percentage : huaweiInvoice.invoiced_percentage
            });

            await huaweiInvoice.save();
            const msg = `Huawei invoice updated successfully - Invoice: ${huaweiInvoice.invoice_no}`;
            logger.info(msg);
            return res.status(200).send({info: msg, data: huaweiInvoice});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while trying to update the Huawei invoice";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete a Huawei invoice
    static async deleteHuaweiInvoiceByID(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const huaweiInvoice = await HuaweiInvoice.findByPk(id);

            if (!huaweiInvoice) return res.status(404).send({error: 'Huawei invoice not found'});
            
            const invoiceNo = huaweiInvoice.invoice_no;
            
            await huaweiInvoice.destroy();
            const msg = `Huawei invoice deleted successfully - Invoice: ${invoiceNo}`;
            logger.info(msg);
            return res.status(200).send({info: msg});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while trying to delete the Huawei invoice";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

export default HuaweiInvoiceController; 