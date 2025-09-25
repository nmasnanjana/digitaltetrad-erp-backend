import {Request, Response} from "express";
import EricssonRateCard from "../models/ericssonRateCard";
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

class EricssonRateCardController {
    // Get all rate cards
    static async getAllRateCards(req: Request, res: Response): Promise<any> {
        try {
            const rateCards = await EricssonRateCard.findAll({
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(rateCards);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching rate cards";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get rate card by ID
    static async getRateCardById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const rateCard = await EricssonRateCard.findByPk(id);

            if (!rateCard) {
                const msg = "Rate card not found";
                logger.warn(msg);
                return res.status(404).send({error: msg});
            }

            return res.status(200).json(rateCard);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching rate card";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Create a new rate card
    static async createRateCard(req: Request, res: Response): Promise<any> {
        try {
            const { product_code, product_description, product_rate } = req.body;
            const uploadedBy = req.user?.id;

            // Validate required fields
            if (!product_code || !product_description || product_rate === undefined) {
                const msg = "All fields are required to create a rate card";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Validate product rate
            if (product_rate < 0) {
                const msg = "Product rate must be non-negative";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const newRateCard = await EricssonRateCard.create({
                product_code,
                product_description,
                product_rate,
                uploaded_by: uploadedBy
            });

            const msg = `New rate card created - Product: ${newRateCard.product_code}`;
            logger.info(msg);

            return res.status(201).send({info: msg, data: newRateCard});
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while creating rate card";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Update rate card
    static async updateRateCard(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { product_code, product_description, product_rate } = req.body;
            const updatedBy = req.user?.id;

            const rateCard = await EricssonRateCard.findByPk(id);

            if (!rateCard) {
                const msg = "Rate card not found";
                logger.warn(msg);
                return res.status(404).send({error: msg});
            }

            // Validate product rate if provided
            if (product_rate !== undefined && product_rate < 0) {
                const msg = "Product rate must be non-negative";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const updateData: any = {};
            if (product_code !== undefined) updateData.product_code = product_code;
            if (product_description !== undefined) updateData.product_description = product_description;
            if (product_rate !== undefined) updateData.product_rate = product_rate;

            await rateCard.update(updateData);
            await rateCard.save();

            const msg = `Rate card updated successfully - Product: ${rateCard.product_code}`;
            logger.info(msg);

            return res.status(200).send({info: msg, data: rateCard});
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while updating rate card";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete rate card
    static async deleteRateCard(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;

            const rateCard = await EricssonRateCard.findByPk(id);

            if (!rateCard) {
                const msg = "Rate card not found";
                logger.warn(msg);
                return res.status(404).send({error: msg});
            }

            await rateCard.destroy();

            const msg = `Rate card deleted successfully - Product: ${rateCard.product_code}`;
            logger.info(msg);

            return res.status(200).send({info: msg});
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while deleting rate card";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete all rate cards
    static async deleteAllRateCards(req: Request, res: Response): Promise<any> {
        try {
            const count = await EricssonRateCard.count();

            if (count === 0) {
                const msg = "No rate cards found to delete";
                logger.warn(msg);
                return res.status(404).send({error: msg});
            }

            await EricssonRateCard.destroy({
                where: {},
                truncate: true
            });

            const msg = `All ${count} rate cards deleted successfully`;
            logger.info(msg);

            return res.status(200).send({info: msg, deletedCount: count});
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while deleting all rate cards";
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
                   
                   // Look for the rate card sheet - try multiple possible names
                   let sheetName = null;
                   const possibleSheetNames = [
                       'Rate Card Price Revision - 2023',
                       'Rate Card',
                       'Rate Cards',
                       'Price List',
                       'Products'
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

            if (jsonData.length < 2) {
                const msg = "Excel file must have at least 2 rows (headers and data)";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Extract headers from first row
            const headers = jsonData[0] as string[];
            
                               // Find column indices for the expected columns
                   const columnMap = {
                       productCode: headers.findIndex(h => h?.toString().toLowerCase().includes('product') && h?.toString().toLowerCase().includes('code')),
                       productDescription: headers.findIndex(h => h?.toString().toLowerCase().includes('product') && h?.toString().toLowerCase().includes('description')),
                       productRate: headers.findIndex(h => h?.toString().toLowerCase().includes('rate') || h?.toString().toLowerCase().includes('price') || h?.toString().toLowerCase().includes('proposed')),
                   };

                   // Fallback column mapping if exact matches not found
                   if (columnMap.productCode === -1) {
                       columnMap.productCode = headers.findIndex(h => h?.toString().toLowerCase().includes('code'));
                   }
                   if (columnMap.productDescription === -1) {
                       columnMap.productDescription = headers.findIndex(h => h?.toString().toLowerCase().includes('description'));
                   }
                   if (columnMap.productRate === -1) {
                       columnMap.productRate = headers.findIndex(h => h?.toString().toLowerCase().includes('amount') || h?.toString().toLowerCase().includes('cost') || h?.toString().toLowerCase().includes('lkr'));
                   }

            // Validate that we found required columns
            const missingColumns = Object.entries(columnMap)
                .filter(([key, index]) => index === -1)
                .map(([key]) => key);

            if (missingColumns.length > 0) {
                const msg = `Missing required columns: ${missingColumns.join(', ')}. Found columns: ${headers.join(', ')}`;
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Delete existing rate cards before uploading new ones
            await EricssonRateCard.destroy({
                where: {},
                truncate: true
            });

            // Process data rows starting from row 2 (index 1)
            const extractedData: any[] = [];
            let recordsImported = 0;

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i] as any[];
                
                if (!row || row.length === 0) continue;

                const productCode = row[columnMap.productCode]?.toString().trim();
                const productDescription = row[columnMap.productDescription]?.toString().trim();
                const productRate = parseFloat(row[columnMap.productRate]);

                // Skip rows with missing required data
                if (!productCode || !productDescription || isNaN(productRate) || productRate < 0) {
                    continue;
                }

                extractedData.push({
                    product_code: productCode,
                    product_description: productDescription,
                    product_rate: productRate
                });
            }

            // Bulk create rate cards
            if (extractedData.length > 0) {
                await EricssonRateCard.bulkCreate(extractedData.map(item => ({
                    ...item,
                    uploaded_by: uploadedBy
                })));
                recordsImported = extractedData.length;
            }

            // Clean up uploaded file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            const msg = `Successfully uploaded ${recordsImported} rate card records`;
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
                const msg = "An unknown Server error occurred while uploading rate card file";
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
                if (!item.product_code || !item.product_description || typeof item.product_rate !== 'number' || item.product_rate < 0) {
                    const msg = `Invalid data at row ${i + 1}`;
                    logger.warn(msg);
                    return res.status(400).send({error: msg});
                }
            }

            // Delete existing rate cards before uploading new ones
            await EricssonRateCard.destroy({
                where: {},
                truncate: true
            });

            // Bulk create rate cards
            const rateCards = await EricssonRateCard.bulkCreate(data.map(item => ({
                ...item,
                uploaded_by: uploadedBy
            })));

            const msg = `Successfully uploaded ${rateCards.length} rate card records`;
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
                const msg = "An unknown Server error occurred while uploading rate card data";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

export default EricssonRateCardController; 