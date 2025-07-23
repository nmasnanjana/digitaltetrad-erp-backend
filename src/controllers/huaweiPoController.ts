import {Request, Response} from "express";
import HuaweiPo from "../models/huaweiPo";
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

class HuaweiPoController {
    // create a new huawei PO
    static async createHuaweiPo(req: Request, res: Response): Promise<any> {
        try {
            const { 
                job_id, 
                customer_id, 
                site_code, 
                site_id, 
                site_name, 
                po_no, 
                line_no, 
                item_code, 
                item_description, 
                unit_price, 
                requested_quantity 
            } = req.body;

            // Validate required fields
            if (!job_id || !customer_id || !site_code || !site_id || !site_name || 
                !po_no || !line_no || !item_code || !item_description || 
                unit_price === undefined || requested_quantity === undefined) {
                const msg = "All fields are required to create a Huawei PO";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const newHuaweiPo = await HuaweiPo.create({
                job_id,
                customer_id,
                site_code,
                site_id,
                site_name,
                po_no,
                line_no,
                item_code,
                item_description,
                unit_price,
                requested_quantity,
                invoiced_percentage: 0
            });

            const msg = `New Huawei PO created - PO: ${newHuaweiPo.po_no}, Item: ${newHuaweiPo.item_code}`;
            logger.info(msg);
            return res.status(201).send({info: msg, data: newHuaweiPo});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown Server error occurred while creating the Huawei PO';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // upload Excel file and process Huawei PO data
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
            const uploadDir = path.join(__dirname, '../../media/huawei', job_id);
            const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            const jobDateDir = path.join(uploadDir, date, 'po');
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            if (!fs.existsSync(jobDateDir)) {
                fs.mkdirSync(jobDateDir, { recursive: true });
            }

            // Check if there's an existing file for this job and delete it
            const existingRecords = await HuaweiPo.findAll({
                where: { job_id },
                attributes: ['file_path']
            });

            if (existingRecords.length > 0 && existingRecords[0].file_path) {
                const existingFilePath = path.join(__dirname, '../../', existingRecords[0].file_path);
                if (fs.existsSync(existingFilePath)) {
                    fs.unlinkSync(existingFilePath);
                    logger.info(`Deleted existing file: ${existingFilePath}`);
                }
            }

            // Save new file
            const fileName = `huawei_po_${job_id}_${Date.now()}.xlsx`;
            const filePath = path.join(jobDateDir, fileName);
            const relativePath = path.relative(path.join(__dirname, '../../'), filePath);
            
            fs.copyFileSync(req.file.path, filePath);
            fs.unlinkSync(req.file.path); // Remove temp file

            // Read and parse Excel file
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length === 0) {
                const msg = "Excel file is empty or has no valid data";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Extract headers from first row
            const headers = jsonData[0] as string[];
            
            // Find column indices for the expected columns
            const columnMap = {
                site_code: headers.findIndex(h => h?.toLowerCase().includes('site code')),
                site_id: headers.findIndex(h => h?.toLowerCase().includes('site id')),
                site_name: headers.findIndex(h => h?.toLowerCase().includes('site name')),
                po_no: headers.findIndex(h => h?.toLowerCase().includes('po no')),
                line_no: headers.findIndex(h => h?.toLowerCase().includes('po line no')),
                item_code: headers.findIndex(h => h?.toLowerCase().includes('item code')),
                item_description: headers.findIndex(h => h?.toLowerCase().includes('item description')),
                unit_price: headers.findIndex(h => h?.toLowerCase().includes('unit price')),
                requested_quantity: headers.findIndex(h => h?.toLowerCase().includes('requested qty')),
            };

            // Validate that we found all required columns
            const missingColumns = Object.entries(columnMap)
                .filter(([key, index]) => index === -1)
                .map(([key]) => key);

            if (missingColumns.length > 0) {
                const msg = `Missing required columns: ${missingColumns.join(', ')}`;
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Delete existing records for this job
            await HuaweiPo.destroy({ where: { job_id } });

            // Process and insert data (skip header row)
            const huaweiPoRecords = [];
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i] as any[];
                
                // Skip empty rows
                if (!row || row.every(cell => cell === undefined || cell === null || cell === '')) {
                    continue;
                }

                // Extract values using column indices
                const site_code = row[columnMap.site_code]?.toString() || '';
                const site_id = row[columnMap.site_id]?.toString() || '';
                const site_name = row[columnMap.site_name]?.toString() || '';
                const po_no = row[columnMap.po_no]?.toString() || '';
                const line_no = row[columnMap.line_no]?.toString() || '';
                const item_code = row[columnMap.item_code]?.toString() || '';
                const item_description = row[columnMap.item_description]?.toString() || '';
                const unit_price = parseFloat(row[columnMap.unit_price]) || 0;
                const requested_quantity = parseInt(row[columnMap.requested_quantity]) || 0;

                // Validate required fields
                if (!site_code || !site_id || !site_name || !po_no || !line_no || 
                    !item_code || !item_description || unit_price === 0 || requested_quantity === 0) {
                    continue; // Skip invalid rows
                }

                huaweiPoRecords.push({
                    job_id,
                    customer_id,
                    site_code,
                    site_id,
                    site_name,
                    po_no,
                    line_no,
                    item_code,
                    item_description,
                    unit_price,
                    requested_quantity,
                    invoiced_percentage: 0,
                    file_path: relativePath,
                    uploaded_at: new Date(),
                    uploaded_by: uploadedBy
                });
            }

            if (huaweiPoRecords.length === 0) {
                const msg = "No valid data found in Excel file";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Bulk insert records
            await HuaweiPo.bulkCreate(huaweiPoRecords);

            const msg = `Excel file uploaded successfully for job ${job_id}. ${huaweiPoRecords.length} records imported.`;
            logger.info(msg);
            return res.status(200).send({
                info: msg,
                data: {
                    job_id,
                    customer_id,
                    file_path: relativePath,
                    records_imported: huaweiPoRecords.length,
                    uploaded_at: new Date(),
                    uploaded_by: uploadedBy
                }
            });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown Server error occurred while uploading Excel file';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // get file info for a specific job
    static async getFileInfo(req: Request, res: Response): Promise<any> {
        try {
            const { job_id } = req.params;

            const fileInfo = await HuaweiPo.findOne({
                where: { job_id },
                attributes: ['file_path', 'uploaded_at', 'uploaded_by'],
                include: [
                    {
                        model: User,
                        as: 'uploader',
                        attributes: ['firstName', 'lastName', 'username']
                    }
                ]
            });

            if (!fileInfo || !fileInfo.file_path) {
                return res.status(404).send({error: 'No file found for this job'});
            }

            return res.status(200).json({
                job_id,
                file_path: fileInfo.file_path,
                uploaded_at: fileInfo.uploaded_at,
                uploader: (fileInfo as any).uploader
            });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching file info";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // download Excel file
    static async downloadExcelFile(req: Request, res: Response): Promise<any> {
        try {
            const { job_id } = req.params;

            const fileInfo = await HuaweiPo.findOne({
                where: { job_id },
                attributes: ['file_path']
            });

            if (!fileInfo || !fileInfo.file_path) {
                return res.status(404).send({error: 'No file found for this job'});
            }

            const filePath = path.join(__dirname, '../../', fileInfo.file_path);
            
            if (!fs.existsSync(filePath)) {
                return res.status(404).send({error: 'File not found on server'});
            }

            const fileName = path.basename(filePath);
            res.download(filePath, fileName);

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while downloading file";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // get all huawei POs with optional filtering
    static async getAllHuaweiPos(req: Request, res: Response): Promise<any> {
        try {
            const { job_id, customer_id } = req.query;
            
            // Build where clause for optional filtering
            const whereClause: any = {};
            if (job_id) whereClause.job_id = job_id;
            if (customer_id) whereClause.customer_id = customer_id;

            const huaweiPos = await HuaweiPo.findAll({
                where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
                include: [
                    {
                        model: Job,
                        as: 'job',
                        attributes: ['id', 'name', 'status', 'type']
                    },
                    {
                        model: Customer,
                        as: 'customer',
                        attributes: ['id', 'name']
                    },
                    {
                        model: User,
                        as: 'uploader',
                        attributes: ['firstName', 'lastName', 'username']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(huaweiPos);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching the Huawei POs";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // get huawei PO by id
    static async getHuaweiPoByID(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const huaweiPo = await HuaweiPo.findByPk(id, {
                include: [
                    {
                        model: Job,
                        as: 'job',
                        attributes: ['id', 'name', 'status', 'type']
                    },
                    {
                        model: Customer,
                        as: 'customer',
                        attributes: ['id', 'name']
                    },
                    {
                        model: User,
                        as: 'uploader',
                        attributes: ['firstName', 'lastName', 'username']
                    }
                ]
            });

            if (!huaweiPo) return res.status(404).send({error: 'Huawei PO not found'});
            return res.status(200).json(huaweiPo);

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching the Huawei PO";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // get huawei POs by job_id
    static async getHuaweiPosByJobID(req: Request, res: Response): Promise<any> {
        try {
            const { job_id } = req.params;
            const huaweiPos = await HuaweiPo.findAll({
                where: { job_id },
                include: [
                    {
                        model: Job,
                        as: 'job',
                        attributes: ['id', 'name', 'status', 'type']
                    },
                    {
                        model: Customer,
                        as: 'customer',
                        attributes: ['id', 'name']
                    },
                    {
                        model: User,
                        as: 'uploader',
                        attributes: ['firstName', 'lastName', 'username']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(huaweiPos);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching the Huawei POs by job";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // delete all huawei POs by job_id (including files)
    static async deleteHuaweiPosByJobID(req: Request, res: Response): Promise<any> {
        try {
            const { job_id } = req.params;
            const deletedBy = req.user?.id;

            // Get all records for this job to find file paths
            const huaweiPos = await HuaweiPo.findAll({
                where: { job_id },
                attributes: ['id', 'file_path', 'po_no', 'item_code']
            });

            if (huaweiPos.length === 0) {
                return res.status(404).send({error: 'No Huawei PO data found for this job'});
            }

            // Get file path from first record (all records should have same file path)
            const filePath = huaweiPos[0].file_path;
            
            // Delete the physical file if it exists
            if (filePath) {
                const fullFilePath = path.join(__dirname, '../../', filePath);
                if (fs.existsSync(fullFilePath)) {
                    fs.unlinkSync(fullFilePath);
                    logger.info(`Deleted file: ${fullFilePath} for job ${job_id}`);
                }
            }

            // Delete all database records for this job
            const deletedCount = await HuaweiPo.destroy({ where: { job_id } });

            // Log the deletion
            const poNumbers = huaweiPos.map(po => po.po_no).join(', ');
            const itemCodes = huaweiPos.map(po => po.item_code).join(', ');
            
            const msg = `User ${deletedBy} deleted ${deletedCount} Huawei PO records for job ${job_id}. PO Numbers: ${poNumbers}. Item Codes: ${itemCodes}. File: ${filePath}`;
            logger.info(msg);

            return res.status(200).send({
                info: `Successfully deleted ${deletedCount} Huawei PO records and associated file for job ${job_id}`,
                data: {
                    job_id,
                    records_deleted: deletedCount,
                    file_deleted: filePath,
                    deleted_by: deletedBy,
                    deleted_at: new Date()
                }
            });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while deleting Huawei POs by job";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // get huawei POs by customer_id
    static async getHuaweiPosByCustomerID(req: Request, res: Response): Promise<any> {
        try {
            const { customer_id } = req.params;
            const huaweiPos = await HuaweiPo.findAll({
                where: { customer_id },
                include: [
                    {
                        model: Job,
                        as: 'job',
                        attributes: ['id', 'name', 'status', 'type']
                    },
                    {
                        model: Customer,
                        as: 'customer',
                        attributes: ['id', 'name']
                    },
                    {
                        model: User,
                        as: 'uploader',
                        attributes: ['firstName', 'lastName', 'username']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(huaweiPos);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching the Huawei POs by customer";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // update a huawei PO
    static async updateHuaweiPoByID(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { 
                job_id, 
                customer_id, 
                site_code, 
                site_id, 
                site_name, 
                po_no, 
                line_no, 
                item_code, 
                item_description, 
                unit_price, 
                requested_quantity 
            } = req.body;

            const huaweiPo = await HuaweiPo.findByPk(id);
            if (!huaweiPo) return res.status(404).send({error: 'Huawei PO not found'});

            await huaweiPo.update({
                job_id: job_id || huaweiPo.job_id,
                customer_id: customer_id || huaweiPo.customer_id,
                site_code: site_code || huaweiPo.site_code,
                site_id: site_id || huaweiPo.site_id,
                site_name: site_name || huaweiPo.site_name,
                po_no: po_no || huaweiPo.po_no,
                line_no: line_no || huaweiPo.line_no,
                item_code: item_code || huaweiPo.item_code,
                item_description: item_description || huaweiPo.item_description,
                unit_price: unit_price !== undefined ? unit_price : huaweiPo.unit_price,
                requested_quantity: requested_quantity !== undefined ? requested_quantity : huaweiPo.requested_quantity
            });

            await huaweiPo.save();
            const msg = `Huawei PO updated successfully - PO: ${huaweiPo.po_no}`;
            logger.info(msg);
            return res.status(200).send({info: msg, data: huaweiPo});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while trying to update the Huawei PO";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // delete a huawei PO
    static async deleteHuaweiPoByID(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const huaweiPo = await HuaweiPo.findByPk(id);

            if (!huaweiPo) return res.status(404).send({error: 'Huawei PO not found'});
            
            const poNo = huaweiPo.po_no;
            const itemCode = huaweiPo.item_code;
            
            await huaweiPo.destroy();
            const msg = `Huawei PO deleted successfully - PO: ${poNo}, Item: ${itemCode}`;
            logger.info(msg);
            return res.status(200).send({info: msg});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while trying to delete the Huawei PO";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // get huawei POs by PO number
    static async getHuaweiPosByPONumber(req: Request, res: Response): Promise<any> {
        try {
            const { po_no } = req.params;
            const huaweiPos = await HuaweiPo.findAll({
                where: { po_no },
                include: [
                    {
                        model: Job,
                        as: 'job',
                        attributes: ['id', 'name', 'status', 'type']
                    },
                    {
                        model: Customer,
                        as: 'customer',
                        attributes: ['id', 'name']
                    },
                    {
                        model: User,
                        as: 'uploader',
                        attributes: ['firstName', 'lastName', 'username']
                    }
                ],
                order: [['line_no', 'ASC']]
            });

            if (huaweiPos.length === 0) {
                return res.status(404).send({error: 'No Huawei POs found with this PO number'});
            }

            return res.status(200).json(huaweiPos);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching the Huawei POs by PO number";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

export default HuaweiPoController; 