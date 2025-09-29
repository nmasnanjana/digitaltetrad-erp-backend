import {Request, Response} from "express";
import ZtePo from "../models/ztePo";
import Job from "../models/job";
import Customer from "../models/customer";
import User from "../models/user";
import logger from "../utils/logger";
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Extend Express Request to include file upload
declare global {
    namespace Express {
        interface Request {
            file?: Express.Multer.File;
        }
    }
}

class ZtePoController {
    // create a new ZTE PO
    static async createZtePo(req: Request, res: Response): Promise<any> {
        try {
            const { 
                job_id, 
                customer_id, 
                po_line_no,
                purchasing_area,
                site_code, 
                site_name, 
                logic_site_code,
                logic_site_name,
                item_code, 
                item_name, 
                unit,
                po_quantity,
                confirmed_quantity,
                settlement_quantity,
                quantity_bill,
                quantity_cancelled,
                unit_price,
                tax_rate,
                subtotal_excluding_tax,
                subtotal_including_tax,
                pr_line_number,
                description
            } = req.body;

            // Validate required fields
            if (!job_id || !customer_id || !po_line_no || !purchasing_area || !site_code || !site_name || 
                !logic_site_code || !logic_site_name || !item_code || !item_name || !unit ||
                po_quantity === undefined || confirmed_quantity === undefined || settlement_quantity === undefined ||
                quantity_bill === undefined || quantity_cancelled === undefined || unit_price === undefined ||
                tax_rate === undefined || subtotal_excluding_tax === undefined || subtotal_including_tax === undefined ||
                !pr_line_number) {
                const msg = "All required fields are missing to create a ZTE PO";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const newZtePo = await ZtePo.create({
                job_id,
                customer_id,
                po_line_no,
                purchasing_area,
                site_code,
                site_name,
                logic_site_code,
                logic_site_name,
                item_code,
                item_name,
                unit,
                po_quantity: parseFloat(po_quantity.toFixed(2)),
                confirmed_quantity: parseFloat(confirmed_quantity.toFixed(2)),
                settlement_quantity: parseFloat(settlement_quantity.toFixed(2)),
                quantity_bill: parseFloat(quantity_bill.toFixed(2)),
                quantity_cancelled: parseFloat(quantity_cancelled.toFixed(2)),
                unit_price: parseFloat(unit_price.toFixed(2)),
                tax_rate: parseFloat(tax_rate.toFixed(2)),
                subtotal_excluding_tax: parseFloat(subtotal_excluding_tax.toFixed(2)),
                subtotal_including_tax: parseFloat(subtotal_including_tax.toFixed(2)),
                pr_line_number,
                description,
                is_invoiced: false
            });

            const msg = `New ZTE PO created - PO Line: ${newZtePo.po_line_no}, Item: ${newZtePo.item_code}`;
            logger.info(msg);
            return res.status(201).json(newZtePo);

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while creating the ZTE PO';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // upload Excel file and process ZTE PO data
    static async uploadExcelFile(req: Request, res: Response): Promise<any> {
        try {
            const { job_id, customer_id } = req.body;
            const uploadedBy = req.user?.id;

            if (!job_id || !customer_id) {
                const msg = "job_id and customer_id are required";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            if (!req.file) {
                const msg = "Excel file is required";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Validate file type
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];
            
            if (!allowedTypes.includes(req.file.mimetype)) {
                const msg = "Only Excel files (.xlsx, .xls) are allowed";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Create directory structure
            const uploadDir = path.join(__dirname, '../../media/zte', job_id);
            const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            const jobDateDir = path.join(uploadDir, date, 'po');
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            if (!fs.existsSync(jobDateDir)) {
                fs.mkdirSync(jobDateDir, { recursive: true });
            }

            // Check if there's an existing file for this job and delete it
            const existingRecords = await ZtePo.findAll({
                where: { job_id },
                attributes: ['file_path']
            });

            if (existingRecords.length > 0 &&
                existingRecords[0].file_path &&
                fs.existsSync(existingRecords[0].file_path)) {
                fs.unlinkSync(existingRecords[0].file_path);
            }

            // Save the uploaded file
            const fileName = `zte_po_${Date.now()}.${req.file.originalname.split('.').pop()}`;
            const filePath = path.join(jobDateDir, fileName);
            fs.writeFileSync(filePath, req.file.buffer);

            // Read and process the Excel file
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0]; // Use first sheet
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Delete existing records for this job
            await ZtePo.destroy({ where: { job_id } });

            // Process data starting from row 2 (index 1)
            const processedData = [];
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i] as any[];
                
                // Skip empty rows
                if (!row || row.length === 0) continue;

                // Extract data based on column mapping
                const po_line_no = row[1]?.toString().trim(); // Column B
                const purchasing_area = row[2]?.toString().trim(); // Column C
                const site_code = row[4]?.toString().trim(); // Column E
                const site_name = row[5]?.toString().trim(); // Column F
                const logic_site_code = row[6]?.toString().trim(); // Column G
                const logic_site_name = row[7]?.toString().trim(); // Column H
                const item_code = row[8]?.toString().trim(); // Column I
                const item_name = row[9]?.toString().trim(); // Column J
                const unit = row[10]?.toString().trim(); // Column K
                const po_quantity = parseFloat(row[11]) || 0; // Column L
                const confirmed_quantity = parseFloat(row[12]) || 0; // Column M
                const settlement_quantity = parseFloat(row[13]) || 0; // Column N
                const quantity_bill = parseFloat(row[15]) || 0; // Column P
                const quantity_cancelled = parseFloat(row[16]) || 0; // Column Q
                const unit_price = parseFloat(row[17]) || 0; // Column R
                const tax_rate = parseFloat(row[18]) || 0; // Column S
                const subtotal_excluding_tax = parseFloat(row[19]) || 0; // Column T
                const subtotal_including_tax = parseFloat(row[21]) || 0; // Column V
                const pr_line_number = row[22]?.toString().trim(); // Column W
                const description = row[23]?.toString().trim(); // Column X

                // Skip rows where essential fields are empty
                if (!po_line_no || !item_code || !item_name) {
                    continue;
                }

                try {
                    const ztePoData = await ZtePo.create({
                        job_id,
                        customer_id,
                        po_line_no,
                        purchasing_area,
                        site_code,
                        site_name,
                        logic_site_code,
                        logic_site_name,
                        item_code,
                        item_name,
                        unit,
                        po_quantity: parseFloat(po_quantity.toFixed(2)),
                        confirmed_quantity: parseFloat(confirmed_quantity.toFixed(2)),
                        settlement_quantity: parseFloat(settlement_quantity.toFixed(2)),
                        quantity_bill: parseFloat(quantity_bill.toFixed(2)),
                        quantity_cancelled: parseFloat(quantity_cancelled.toFixed(2)),
                        unit_price: parseFloat(unit_price.toFixed(2)),
                        tax_rate: parseFloat(tax_rate.toFixed(2)),
                        subtotal_excluding_tax: parseFloat(subtotal_excluding_tax.toFixed(2)),
                        subtotal_including_tax: parseFloat(subtotal_including_tax.toFixed(2)),
                        pr_line_number,
                        description,
                        is_invoiced: false,
                        file_path: filePath,
                        uploaded_at: new Date(),
                        uploaded_by: uploadedBy
                    });

                    processedData.push(ztePoData);
                } catch (error) {
                    logger.error(`Error processing row ${i + 1}: ${error}`);
                    continue;
                }
            }

            const msg = `Successfully processed ${processedData.length} ZTE PO records from Excel file`;
            logger.info(msg);
            return res.status(200).json({
                message: msg,
                processedCount: processedData.length,
                filePath: filePath
            });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while processing the Excel file';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get all ZTE POs
    static async getAllZtePos(req: Request, res: Response): Promise<any> {
        try {
            const { customerId, jobId } = req.query;
            const where: any = {};

            if (customerId) {
                where.customer_id = customerId;
            }

            if (jobId) {
                where.job_id = jobId;
            }

            const ztePos = await ZtePo.findAll({
                where,
                include: [
                    { model: Job, as: 'job' },
                    { model: Customer, as: 'customer' },
                    { model: User, as: 'uploader' }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(ztePos);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while fetching ZTE POs';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get ZTE PO by ID
    static async getZtePoById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const ztePo = await ZtePo.findByPk(id, {
                include: [
                    { model: Job, as: 'job' },
                    { model: Customer, as: 'customer' },
                    { model: User, as: 'uploader' }
                ]
            });

            if (!ztePo) {
                return res.status(404).send({error: 'ZTE PO not found'});
            }

            return res.status(200).json(ztePo);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while fetching ZTE PO';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get ZTE POs by Job ID
    static async getZtePosByJobId(req: Request, res: Response): Promise<any> {
        try {
            const { jobId } = req.params;
            const ztePos = await ZtePo.findAll({
                where: { job_id: jobId },
                include: [
                    { model: Job, as: 'job' },
                    { model: Customer, as: 'customer' },
                    { model: User, as: 'uploader' }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(ztePos);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while fetching ZTE POs by job ID';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Update ZTE PO by ID
    static async updateZtePoById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Ensure numeric fields are properly formatted
            if (updateData.po_quantity !== undefined) {
                updateData.po_quantity = parseFloat(updateData.po_quantity.toFixed(2));
            }
            if (updateData.confirmed_quantity !== undefined) {
                updateData.confirmed_quantity = parseFloat(updateData.confirmed_quantity.toFixed(2));
            }
            if (updateData.settlement_quantity !== undefined) {
                updateData.settlement_quantity = parseFloat(updateData.settlement_quantity.toFixed(2));
            }
            if (updateData.quantity_bill !== undefined) {
                updateData.quantity_bill = parseFloat(updateData.quantity_bill.toFixed(2));
            }
            if (updateData.quantity_cancelled !== undefined) {
                updateData.quantity_cancelled = parseFloat(updateData.quantity_cancelled.toFixed(2));
            }
            if (updateData.unit_price !== undefined) {
                updateData.unit_price = parseFloat(updateData.unit_price.toFixed(2));
            }
            if (updateData.tax_rate !== undefined) {
                updateData.tax_rate = parseFloat(updateData.tax_rate.toFixed(2));
            }
            if (updateData.subtotal_excluding_tax !== undefined) {
                updateData.subtotal_excluding_tax = parseFloat(updateData.subtotal_excluding_tax.toFixed(2));
            }
            if (updateData.subtotal_including_tax !== undefined) {
                updateData.subtotal_including_tax = parseFloat(updateData.subtotal_including_tax.toFixed(2));
            }

            const [updatedRowsCount] = await ZtePo.update(updateData, {
                where: { id }
            });

            if (updatedRowsCount === 0) {
                return res.status(404).send({error: 'ZTE PO not found'});
            }

            const updatedZtePo = await ZtePo.findByPk(id);
            return res.status(200).json(updatedZtePo);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while updating ZTE PO';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete ZTE PO by ID
    static async deleteZtePoById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const deletedRowsCount = await ZtePo.destroy({
                where: { id }
            });

            if (deletedRowsCount === 0) {
                return res.status(404).send({error: 'ZTE PO not found'});
            }

            return res.status(200).json({message: 'ZTE PO deleted successfully'});
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while deleting ZTE PO';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete ZTE POs by Job ID
    static async deleteZtePosByJobId(req: Request, res: Response): Promise<any> {
        try {
            const { jobId } = req.params;

            // Get file paths before deletion
            const ztePos = await ZtePo.findAll({
                where: { job_id: jobId },
                attributes: ['file_path']
            });

            // Delete files
            for (const ztePo of ztePos) {
                if (ztePo.file_path && fs.existsSync(ztePo.file_path)) {
                    try {
                        fs.unlinkSync(ztePo.file_path);
                    } catch (error) {
                        logger.warn(`Failed to delete file: ${ztePo.file_path}`);
                    }
                }
            }

            const deletedRowsCount = await ZtePo.destroy({
                where: { job_id: jobId }
            });

            const msg = `Deleted ${deletedRowsCount} ZTE PO records for job ${jobId}`;
            logger.info(msg);
            return res.status(200).json({message: msg, deletedCount: deletedRowsCount});
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while deleting ZTE POs by job ID';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Download ZTE PO file
    static async downloadZtePoFile(req: Request, res: Response): Promise<any> {
        try {
            const { jobId } = req.params;

            const ztePos = await ZtePo.findAll({
                where: { job_id: jobId },
                order: [['createdAt', 'DESC']]
            });

            if (ztePos.length === 0) {
                return res.status(404).send({error: 'No ZTE PO data found for this job'});
            }

            // Create Excel file
            const worksheet = XLSX.utils.json_to_sheet(ztePos.map(po => ({
                'PO Line No': po.po_line_no,
                'Purchasing Area': po.purchasing_area,
                'Site Code': po.site_code,
                'Site Name': po.site_name,
                'Logic Site Code': po.logic_site_code,
                'Logic Site Name': po.logic_site_name,
                'Item Code': po.item_code,
                'Item Name': po.item_name,
                'Unit': po.unit,
                'PO Quantity': po.po_quantity,
                'Confirmed Quantity': po.confirmed_quantity,
                'Settlement Quantity': po.settlement_quantity,
                'Quantity Bill': po.quantity_bill,
                'Quantity Cancelled': po.quantity_cancelled,
                'Unit Price': po.unit_price,
                'Tax Rate': po.tax_rate,
                'Subtotal (Excluding Tax)': po.subtotal_excluding_tax,
                'Subtotal (Including Tax)': po.subtotal_including_tax,
                'PR Line Number': po.pr_line_number,
                'Description': po.description
            })));

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'ZTE PO Data');

            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=zte_po_${jobId}_${new Date().toISOString().split('T')[0]}.xlsx`);
            res.send(buffer);

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while downloading ZTE PO file';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

export default ZtePoController;


