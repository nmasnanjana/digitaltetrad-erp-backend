import {Request, Response} from "express";
import Settings from "../models/settings";
import logger from "../utils/logger";

class SettingsController {
    // Get all settings (there should only be one record)
    static async getSettings(req: Request, res: Response): Promise<any> {
        try {
            let settings = await Settings.findOne();
            
            // If no settings exist, create default settings
            if (!settings) {
                settings = await Settings.create({
                    currency: 'USD',
                    vat_percentage: 0.00,
                    vat_number: '',
                    business_registration_number: '',
                    contact_number: '',
                    email: '',
                    finance_email: '',
                    company_name: 'Company Name',
                    bank_account: '',
                    updated_by: req.user?.id
                });
                logger.info('Default settings created');
            }

            return res.status(200).json(settings);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while fetching settings";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Update settings
    static async updateSettings(req: Request, res: Response): Promise<any> {
        try {
            const {
                currency,
                vat_percentage,
                vat_number,
                business_registration_number,
                contact_number,
                email,
                finance_email,
                company_name,
                bank_account
            } = req.body;

            let settings = await Settings.findOne();
            
            // If no settings exist, create new settings
            if (!settings) {
                settings = await Settings.create({
                    currency: currency || 'USD',
                    vat_percentage: vat_percentage || 0.00,
                    vat_number: vat_number || '',
                    business_registration_number: business_registration_number || '',
                    contact_number: contact_number || '',
                    email: email || '',
                    finance_email: finance_email || '',
                    company_name: company_name || 'Company Name',
                    bank_account: bank_account || '',
                    updated_by: req.user?.id
                });
                
                const msg = `Settings created successfully by user ${req.user?.id}`;
                logger.info(msg);
                return res.status(201).send({info: msg, data: settings});
            }

            // Validate VAT percentage
            if (vat_percentage !== undefined && (vat_percentage < 0 || vat_percentage > 100)) {
                const msg = "VAT percentage must be between 0 and 100";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Validate email formats
            if (email && !isValidEmail(email)) {
                const msg = "Invalid email format";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            if (finance_email && !isValidEmail(finance_email)) {
                const msg = "Invalid finance email format";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Update settings
            const updateData: any = {};
            
            if (currency !== undefined) updateData.currency = currency;
            if (vat_percentage !== undefined) updateData.vat_percentage = vat_percentage;
            if (vat_number !== undefined) updateData.vat_number = vat_number;
            if (business_registration_number !== undefined) updateData.business_registration_number = business_registration_number;
            if (contact_number !== undefined) updateData.contact_number = contact_number;
            if (email !== undefined) updateData.email = email;
            if (finance_email !== undefined) updateData.finance_email = finance_email;
            if (company_name !== undefined) updateData.company_name = company_name;
            if (bank_account !== undefined) updateData.bank_account = bank_account;
            
            updateData.updated_by = req.user?.id;

            await settings.update(updateData);
            await settings.save();

            const msg = `Settings updated successfully by user ${req.user?.id}`;
            logger.info(msg);

            return res.status(200).send({info: msg, data: settings});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while updating settings";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Reset settings to defaults
    static async resetSettings(req: Request, res: Response): Promise<any> {
        try {
            let settings = await Settings.findOne();
            
            if (!settings) {
                settings = await Settings.create({
                    currency: 'USD',
                    vat_percentage: 0.00,
                    vat_number: '',
                    business_registration_number: '',
                    contact_number: '',
                    email: '',
                    finance_email: '',
                    company_name: 'Company Name',
                    bank_account: '',
                    updated_by: req.user?.id
                });
            } else {
                await settings.update({
                    currency: 'USD',
                    vat_percentage: 0.00,
                    vat_number: '',
                    business_registration_number: '',
                    contact_number: '',
                    email: '',
                    finance_email: '',
                    company_name: 'Company Name',
                    bank_account: '',
                    updated_by: req.user?.id
                });
                await settings.save();
            }

            const msg = `Settings reset to defaults by user ${req.user?.id}`;
            logger.info(msg);

            return res.status(200).send({info: msg, data: settings});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown Server error occurred while resetting settings";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export default SettingsController; 