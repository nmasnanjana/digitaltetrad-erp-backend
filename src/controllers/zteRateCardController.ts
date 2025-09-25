import {Request, Response} from "express";
import ZteRateCard from "../models/zteRateCard";
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

class ZteRateCardController {
    // Get all rate cards
    static async getAllRateCards(req: Request, res: Response): Promise<any> {
        try {
            const rateCards = await ZteRateCard.findAll({
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(rateCards);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching ZTE rate cards";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get rate card by ID
    static async getRateCardById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const rateCard = await ZteRateCard.findByPk(id);

            if (!rateCard) {
                const msg = "ZTE rate card not found";
                logger.warn(msg);
                return res.status(404).send({error: msg});
            }

            return res.status(200).json(rateCard);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching ZTE rate card";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Create a new rate card
    static async createRateCard(req: Request, res: Response): Promise<any> {
        try {
            const { code, item, unit, price } = req.body;
            const uploadedBy = req.user?.id;

            // Validate required fields
            if (!code || !item || !unit || price === undefined) {
                const msg = "Code, item, unit, and price are required to create a ZTE rate card";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Validate price
            if (price < 0) {
                const msg = "Price must be non-negative";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const newRateCard = await ZteRateCard.create({
                code,
                item,
                unit,
                price: parseFloat(price.toFixed(2)),
                uploaded_by: uploadedBy
            });

            const msg = `New ZTE rate card created - Code: ${newRateCard.code}`;
            logger.info(msg);

            return res.status(201).send({info: msg, data: newRateCard});
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while creating ZTE rate card";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Update rate card
    static async updateRateCard(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { code, item, unit, price } = req.body;
            const updatedBy = req.user?.id;

            const rateCard = await ZteRateCard.findByPk(id);

            if (!rateCard) {
                const msg = "ZTE rate card not found";
                logger.warn(msg);
                return res.status(404).send({error: msg});
            }

            // Validate price if provided
            if (price !== undefined && price < 0) {
                const msg = "Price must be non-negative";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const updateData: any = {};
            if (code !== undefined) updateData.code = code;
            if (item !== undefined) updateData.item = item;
            if (unit !== undefined) updateData.unit = unit;
            if (price !== undefined) updateData.price = parseFloat(price.toFixed(2));

            await rateCard.update(updateData);
            await rateCard.save();

            const msg = `ZTE rate card updated successfully - Code: ${rateCard.code}`;
            logger.info(msg);

            return res.status(200).send({info: msg, data: rateCard});
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while updating ZTE rate card";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete rate card
    static async deleteRateCard(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;

            const rateCard = await ZteRateCard.findByPk(id);

            if (!rateCard) {
                const msg = "ZTE rate card not found";
                logger.warn(msg);
                return res.status(404).send({error: msg});
            }

            await rateCard.destroy();

            const msg = `ZTE rate card deleted successfully - Code: ${rateCard.code}`;
            logger.info(msg);

            return res.status(200).send({info: msg});
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while deleting ZTE rate card";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete all rate cards
    static async deleteAllRateCards(req: Request, res: Response): Promise<any> {
        try {
            const count = await ZteRateCard.count();

            if (count === 0) {
                const msg = "No ZTE rate cards found to delete";
                logger.warn(msg);
                return res.status(404).send({error: msg});
            }

            await ZteRateCard.destroy({
                where: {},
                truncate: true
            });

            const msg = `All ${count} ZTE rate cards deleted successfully`;
            logger.info(msg);

            return res.status(200).send({info: msg, deletedCount: count});
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while deleting all ZTE rate cards";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Upload Excel file and process rate card data
    static async uploadExcelFile(req: Request, res: Response): Promise<any> {
        try {
            const uploadedBy = req.user?.id;

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

            // Read and parse Excel file
            const workbook = XLSX.readFile(req.file.path);
            
            // Look for the "L3 Unit Price" sheet specifically
            let sheetName = null;
            const possibleSheetNames = [
                'L3 Unit Price',
                'ZTE Rate Card',
                'Rate Card',
                'Rate Cards',
                'Price List',
                'Products',
                'Items'
            ];
            
            for (const name of possibleSheetNames) {
                if (workbook.SheetNames.includes(name)) {
                    sheetName = name;
                    break;
                }
            }
            
            // If no specific sheet found, use the first sheet
            if (!sheetName) {
                sheetName = workbook.SheetNames[0];
            }
            
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length < 10) {
                const msg = "Excel file must have at least 10 rows (data starts from row 9)";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // For ZTE format, we know the exact column positions:
            // B column (index 1) = Code
            // C column (index 2) = Item  
            // D column (index 3) = Unit
            // F column (index 5) = Price
            const columnMap = {
                code: 1,    // B column
                item: 2,    // C column
                unit: 3,    // D column
                price: 5    // F column
            };

            // Delete existing rate cards before uploading new ones
            await ZteRateCard.destroy({
                where: {},
                truncate: true
            });

            // Process data rows starting from row 9 (index 8)
            const extractedData: any[] = [];
            let recordsImported = 0;

            for (let i = 8; i < jsonData.length; i++) {
                const row = jsonData[i] as any[];
                
                if (!row || row.length === 0) continue;

                const code = row[columnMap.code]?.toString().trim();
                const item = row[columnMap.item]?.toString().trim();
                const unit = row[columnMap.unit]?.toString().trim();
                const price = parseFloat(parseFloat(row[columnMap.price]).toFixed(2));

                // Skip rows where only item column is populated (as per requirement)
                if (!code && !unit && !price && item) {
                    continue;
                }

                // Skip rows with missing required data
                if (!code || !item || !unit || isNaN(price) || price < 0) {
                    continue;
                }

                extractedData.push({
                    code,
                    item,
                    unit,
                    price
                });
            }

            // Bulk create rate cards
            if (extractedData.length > 0) {
                await ZteRateCard.bulkCreate(extractedData.map(item => ({
                    ...item,
                    uploaded_by: uploadedBy
                })));
                recordsImported = extractedData.length;
            }

            // Clean up uploaded file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            const msg = `Successfully uploaded ${recordsImported} ZTE rate card records`;
            logger.info(msg);

            return res.status(200).send({
                info: msg,
                data: {
                    recordsImported,
                    extractedData
                }
            });

        } catch (e: unknown) {
            // Clean up uploaded file on error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while uploading ZTE rate card file";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Upload edited data directly
    static async uploadData(req: Request, res: Response): Promise<any> {
        try {
            const uploadedBy = req.user?.id;
            const data = req.body;

            if (!Array.isArray(data)) {
                const msg = "Data must be an array";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            if (data.length === 0) {
                const msg = "No data provided";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Validate data structure
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                if (!item.code || !item.item || !item.unit || typeof item.price !== 'number' || item.price < 0) {
                    const msg = `Invalid data at row ${i + 1}`;
                    logger.warn(msg);
                    return res.status(400).send({error: msg});
                }
            }

            // Delete existing rate cards before uploading new ones
            await ZteRateCard.destroy({
                where: {},
                truncate: true
            });

            // Bulk create rate cards
            const rateCards = await ZteRateCard.bulkCreate(data.map(item => ({
                ...item,
                remark: item.remark || '',
                uploaded_by: uploadedBy
            })));

            const msg = `Successfully uploaded ${rateCards.length} ZTE rate card records`;
            logger.info(msg);

            return res.status(200).send({
                info: msg,
                data: {
                    recordsImported: rateCards.length,
                    extractedData: data
                }
            });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while uploading ZTE rate card data";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

export default ZteRateCardController;
