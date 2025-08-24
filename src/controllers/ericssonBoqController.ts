import {Request, Response} from "express";
import EricssonBoq from "../models/ericssonBoq";
import EricssonBoqItem from "../models/ericssonBoqItem";
import EricssonBoqRemoveMaterial from "../models/ericssonBoqRemoveMaterial";
import EricssonBoqSurplusMaterial from "../models/ericssonBoqSurplusMaterial";
import EricssonRateCard from "../models/ericssonRateCard";
import logger from "../utils/logger";
import * as XLSX from 'xlsx';
import * as fs from 'fs';

// Extend Express Request to include file upload
declare global {
    namespace Express {
        interface Request {
            file?: Express.Multer.File;
        }
    }
}

class EricssonBoqController {
    // Get BOQ by job ID
    static async getBoqByJobId(req: Request, res: Response): Promise<any> {
        try {
            const { jobId } = req.params;
            logger.info(`Getting BOQ data for job ID: ${jobId}`);
            
            const boq = await EricssonBoq.findOne({
                where: { job_id: jobId },
                include: [
                    {
                        model: EricssonBoqItem,
                        as: 'items',
                        include: [
                            {
                                model: EricssonRateCard,
                                as: 'rateCard'
                            }
                        ]
                    },
                    {
                        model: EricssonBoqRemoveMaterial,
                        as: 'removeMaterials'
                    },
                    {
                        model: EricssonBoqSurplusMaterial,
                        as: 'surplusMaterials'
                    }
                ]
            });

            if (!boq) {
                logger.info(`BOQ not found for job ID: ${jobId}`);
                return res.status(404).send({ error: 'BOQ not found for this job' });
            }

            logger.info(`BOQ found for job ID: ${jobId}, items: ${(boq as any).items?.length || 0}, remove materials: ${(boq as any).removeMaterials?.length || 0}, surplus materials: ${(boq as any).surplusMaterials?.length || 0}`);
            return res.status(200).send(boq);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown Server error occurred while getting BOQ";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Upload Excel file and process BOQ data
    static async uploadExcelFile(req: Request, res: Response): Promise<any> {
        try {
            const uploadedBy = req.user?.id;
            const { job_id } = req.body;

            if (!req.file) {
                const msg = "Excel file is required";
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            if (!job_id) {
                const msg = "Job ID is required";
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            // Validate file type
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];
            
            if (!allowedTypes.includes(req.file.mimetype)) {
                const msg = "Only Excel files (.xlsx, .xls) are allowed";
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            // Read and parse Excel file
            const workbook = XLSX.readFile(req.file.path);
            
            // Check if required sheets exist (with trimmed names to handle spaces)
            const requiredSheets = ['Main', 'BOQ', 'Remove', 'Surplus'];
            const availableSheets = workbook.SheetNames.map(name => name.trim());
            const missingSheets = requiredSheets.filter(sheet => !availableSheets.includes(sheet));
            
            logger.info('Available sheets:', workbook.SheetNames);
            logger.info('Available sheets (trimmed):', availableSheets);
            logger.info('Required sheets:', requiredSheets);
            logger.info('Missing sheets:', missingSheets);
            
            if (missingSheets.length > 0) {
                const msg = `Missing required sheets: ${missingSheets.join(', ')}. Available sheets: ${workbook.SheetNames.join(', ')}`;
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            // Extract data from Main sheet
            const mainSheet = workbook.Sheets['Main'];
            const mainData = XLSX.utils.sheet_to_json(mainSheet, { header: 1 });
            
            let project = '', siteId = '', siteName = '', purchaseOrderNumber = '';
            
            for (const row of mainData) {
                if (Array.isArray(row) && row.length >= 2) {
                    const key = row[0]?.toString().toLowerCase();
                    const value = row[1]?.toString();
                    
                    if (key?.includes('project')) project = value || '';
                    if (key?.includes('site id')) siteId = value || '';
                    if (key?.includes('site name')) siteName = value || '';
                    if (key?.includes('purchase order number')) purchaseOrderNumber = value || '';
                }
            }

            // Validate required fields from Main sheet
            if (!project || !siteId || !siteName || !purchaseOrderNumber) {
                const msg = `Missing required fields from Main sheet. Found: Project=${project}, Site ID=${siteId}, Site Name=${siteName}, PO Number=${purchaseOrderNumber}`;
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            // Check if BOQ already exists for this job
            const existingBoq = await EricssonBoq.findOne({ where: { job_id } });
            if (existingBoq) {
                const msg = `BOQ already exists for job ${job_id}. Please delete existing BOQ first.`;
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            // Create BOQ record
            const boq = await EricssonBoq.create({
                job_id,
                project,
                site_id: siteId,
                site_name: siteName,
                purchase_order_number: purchaseOrderNumber,
                uploaded_by: uploadedBy
            });

            // Extract data from BOQ sheet
            const boqSheet = workbook.Sheets['BOQ'];
            const boqData = XLSX.utils.sheet_to_json(boqSheet, { header: 1 });
            
            // Find headers row
            let headersRow = 0;
            for (let i = 0; i < boqData.length; i++) {
                const row = boqData[i] as any[];
                if (row && row.some(cell => cell?.toString().toLowerCase().includes('service number'))) {
                    headersRow = i;
                    break;
                }
            }

            const headers = boqData[headersRow] as string[];
            
            // Find column indices
            const columnMap = {
                serviceNumber: headers.findIndex(h => h?.toString().toLowerCase().includes('service number')),
                itemDescription: headers.findIndex(h => h?.toString().toLowerCase().includes('item description')),
                uom: headers.findIndex(h => h?.toString().toLowerCase().includes('uom')),
                qty: headers.findIndex(h => h?.toString().toLowerCase().includes('qty')),
            };

            // Validate column mapping
            const missingColumns = Object.entries(columnMap)
                .filter(([key, index]) => index === -1)
                .map(([key]) => key);

            if (missingColumns.length > 0) {
                const msg = `Missing required columns in BOQ sheet: ${missingColumns.join(', ')}`;
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            // Get all rate cards for matching
            const rateCards = await EricssonRateCard.findAll();
            const rateCardMap = new Map();
            rateCards.forEach(card => {
                rateCardMap.set(card.product_code.toLowerCase(), card);
            });

            // Process BOQ items
            const boqItems: any[] = [];
            let isAdditionalWork = false;

            for (let i = headersRow + 1; i < boqData.length; i++) {
                const row = boqData[i] as any[];
                
                if (!row || row.length === 0) continue;

                // Check if this is the "Additional Work" row
                if (row.some(cell => cell?.toString().toLowerCase().includes('additional work'))) {
                    isAdditionalWork = true;
                    continue;
                }

                const serviceNumber = row[columnMap.serviceNumber]?.toString().trim();
                const itemDescription = row[columnMap.itemDescription]?.toString().trim();
                const uom = row[columnMap.uom]?.toString().trim();
                const qty = parseFloat(row[columnMap.qty]);

                // Skip rows with missing required data
                if (!serviceNumber || !itemDescription || !uom || isNaN(qty) || qty <= 0) {
                    continue;
                }

                // Find matching rate card
                const rateCard = rateCardMap.get(serviceNumber.toLowerCase());
                const unitPrice = rateCard ? rateCard.product_rate : 0;
                const totalAmount = unitPrice * qty;

                boqItems.push({
                    boq_id: boq.id,
                    service_number: serviceNumber,
                    item_description: itemDescription,
                    uom,
                    qty,
                    unit_price: unitPrice,
                    total_amount: totalAmount,
                    is_additional_work: isAdditionalWork,
                    rate_card_id: rateCard ? rateCard.id : null,
                    uploaded_by: uploadedBy
                });
            }

            // Create BOQ items
            if (boqItems.length > 0) {
                await EricssonBoqItem.bulkCreate(boqItems);
            }

            // Extract data from Remove sheet
            const removeSheetName = workbook.SheetNames.find(name => name.trim() === 'Remove');
            logger.info('Remove sheet name found:', removeSheetName);
            const removeSheet = workbook.Sheets[removeSheetName || 'Remove'];
            logger.info('Remove sheet object:', removeSheet ? 'Found' : 'Not found');
            const removeData = XLSX.utils.sheet_to_json(removeSheet, { header: 1 });
            
            logger.info('Remove sheet data structure:', JSON.stringify(removeData.slice(0, 10), null, 2));
            
            // Find headers row for Remove sheet - look for specific column structure
            let removeHeadersRow = 13; // Row 14 (index 13) based on user input
            logger.info('Using fixed header row 14 (index 13) for Remove sheet');
            
            // Verify the header structure
            const headerRow = removeData[removeHeadersRow] as any[];
            if (headerRow) {
                logger.info(`Remove header row ${removeHeadersRow}:`, headerRow);
            }

            const removeHeaders = removeData[removeHeadersRow] as string[];
            logger.info('Remove headers found:', removeHeaders);
            
            // Use fixed column indices based on user input: B=1, C=2, E=4
            const removeColumnMap = {
                slNo: 1, // B column (index 1)
                materialDescription: 2, // C column (index 2)
                qty: 4, // E column (index 4)
                remarks: 3, // D column (index 3) - assuming this is the remarks column
            };
            
            logger.info('Using fixed column mapping for Remove sheet:', removeColumnMap);

            logger.info('Remove column map:', removeColumnMap);

            // Process Remove materials
            const removeMaterials: any[] = [];
            logger.info(`Processing Remove materials from row ${removeHeadersRow + 1} (index ${removeHeadersRow + 1}) to ${removeData.length}`);
            logger.info(`Total rows in Remove sheet: ${removeData.length}`);
            
            for (let i = removeHeadersRow + 1; i < removeData.length; i++) {
                const row = removeData[i] as any[];
                
                logger.info(`Processing row ${i}:`, row);
                
                if (!row || row.length === 0) {
                    logger.info(`Skipping row ${i} - empty row`);
                    continue;
                }

                logger.info(`Row ${i} length: ${row.length}`);
                logger.info(`Row ${i} data:`, row);

                const slNo = row[removeColumnMap.slNo]?.toString().trim() || '';
                const materialDescription = row[removeColumnMap.materialDescription]?.toString().trim();
                const qty = row[removeColumnMap.qty]?.toString().trim();
                const remarks = row[removeColumnMap.remarks]?.toString().trim() || '';

                logger.info(`Row ${i} extracted: slNo="${slNo}", materialDescription="${materialDescription}", qty="${qty}", remarks="${remarks}"`);

                // Skip rows with missing required data - only material description and qty are required
                if (!materialDescription || !qty) {
                    logger.info(`Skipping row ${i} - missing required data (materialDescription: ${!!materialDescription}, qty: ${!!qty})`);
                    continue;
                }

                logger.info(`Adding Remove material: ${materialDescription} (${qty})`);
                removeMaterials.push({
                    boq_id: boq.id,
                    sl_no: slNo,
                    material_description: materialDescription,
                    qty,
                    remarks,
                    material_type: 'removal' as const,
                    uploaded_by: uploadedBy
                });
            }

            logger.info(`Found ${removeMaterials.length} remove materials`);

            // Extract data from Surplus sheet
            const surplusSheetName = workbook.SheetNames.find(name => name.trim() === 'Surplus');
            logger.info('Surplus sheet name found:', surplusSheetName);
            const surplusSheet = workbook.Sheets[surplusSheetName || 'Surplus'];
            logger.info('Surplus sheet object:', surplusSheet ? 'Found' : 'Not found');
            const surplusData = XLSX.utils.sheet_to_json(surplusSheet, { header: 1 });
            
            logger.info('Surplus sheet data structure:', JSON.stringify(surplusData.slice(0, 10), null, 2));
            
            // Find headers row for Surplus sheet - use same structure as Remove
            let surplusHeadersRow = 13; // Row 14 (index 13) based on user input
            logger.info('Using fixed header row 14 (index 13) for Surplus sheet');
            
            // Verify the header structure
            const surplusHeaderRow = surplusData[surplusHeadersRow] as any[];
            if (surplusHeaderRow) {
                logger.info(`Surplus header row ${surplusHeadersRow}:`, surplusHeaderRow);
            }

            const surplusHeaders = surplusData[surplusHeadersRow] as string[];
            logger.info('Surplus headers found:', surplusHeaders);
            
            // Use fixed column indices based on user input: B=1, C=2, E=4
            const surplusColumnMap = {
                slNo: 1, // B column (index 1)
                materialDescription: 2, // C column (index 2)
                qty: 4, // E column (index 4)
                remarks: 3, // D column (index 3) - assuming this is the remarks column
            };
            
            logger.info('Using fixed column mapping for Surplus sheet:', surplusColumnMap);

            logger.info('Surplus column map:', surplusColumnMap);

            // Process Surplus materials
            const surplusMaterials: any[] = [];
            logger.info(`Processing Surplus materials from row ${surplusHeadersRow + 1} (index ${surplusHeadersRow + 1}) to ${surplusData.length}`);
            logger.info(`Total rows in Surplus sheet: ${surplusData.length}`);
            
            for (let i = surplusHeadersRow + 1; i < surplusData.length; i++) {
                const row = surplusData[i] as any[];
                
                logger.info(`Processing Surplus row ${i}:`, row);
                
                if (!row || row.length === 0) {
                    logger.info(`Skipping Surplus row ${i} - empty row`);
                    continue;
                }

                logger.info(`Surplus row ${i} length: ${row.length}`);
                logger.info(`Surplus row ${i} data:`, row);

                const slNo = row[surplusColumnMap.slNo]?.toString().trim() || '';
                const materialDescription = row[surplusColumnMap.materialDescription]?.toString().trim();
                const qty = row[surplusColumnMap.qty]?.toString().trim();
                const remarks = row[surplusColumnMap.remarks]?.toString().trim() || '';

                logger.info(`Surplus row ${i} extracted: slNo="${slNo}", materialDescription="${materialDescription}", qty="${qty}", remarks="${remarks}"`);

                // Skip rows with missing required data - only material description and qty are required
                if (!materialDescription || !qty) {
                    logger.info(`Skipping Surplus row ${i} - missing required data (materialDescription: ${!!materialDescription}, qty: ${!!qty})`);
                    continue;
                }

                logger.info(`Adding Surplus material: ${materialDescription} (${qty})`);
                surplusMaterials.push({
                    boq_id: boq.id,
                    sl_no: slNo,
                    material_description: materialDescription,
                    qty,
                    remarks,
                    material_type: 'surplus' as const,
                    uploaded_by: uploadedBy
                });
            }

            logger.info(`Found ${surplusMaterials.length} surplus materials`);

            // Create remove materials
            if (removeMaterials.length > 0) {
                await EricssonBoqRemoveMaterial.bulkCreate(removeMaterials);
            }

            // Create surplus materials
            if (surplusMaterials.length > 0) {
                await EricssonBoqSurplusMaterial.bulkCreate(surplusMaterials);
            }

            // Clean up uploaded file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            const msg = `Successfully uploaded BOQ with ${boqItems.length} items, ${removeMaterials.length} remove materials, and ${surplusMaterials.length} surplus materials`;
            logger.info(msg);

            // Return the created data
            const createdBoq = await EricssonBoq.findByPk(boq.id, {
                include: [
                    {
                        model: EricssonBoqItem,
                        as: 'items',
                        include: [
                            {
                                model: EricssonRateCard,
                                as: 'rateCard'
                            }
                        ]
                    },
                    {
                        model: EricssonBoqRemoveMaterial,
                        as: 'removeMaterials'
                    },
                    {
                        model: EricssonBoqSurplusMaterial,
                        as: 'surplusMaterials'
                    }
                ]
            });

            return res.status(200).send({
                info: msg,
                data: createdBoq
            });

        } catch (e: unknown) {
            // Clean up uploaded file on error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown Server error occurred while uploading BOQ file";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Delete BOQ by job ID
    static async deleteBoqByJobId(req: Request, res: Response): Promise<any> {
        try {
            const { jobId } = req.params;
            
            const boq = await EricssonBoq.findOne({ where: { job_id: jobId } });
            if (!boq) {
                return res.status(404).send({ error: 'BOQ not found for this job' });
            }

            // Delete related items and materials first
            await EricssonBoqItem.destroy({ where: { boq_id: boq.id } });
            await EricssonBoqRemoveMaterial.destroy({ where: { boq_id: boq.id } });
            await EricssonBoqSurplusMaterial.destroy({ where: { boq_id: boq.id } });
            
            // Delete the BOQ
            await boq.destroy();

            const msg = `Successfully deleted BOQ for job ${jobId}`;
            logger.info(msg);

            return res.status(200).send({ info: msg });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = "An unknown Server error occurred while deleting BOQ";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }
}

export default EricssonBoqController; 