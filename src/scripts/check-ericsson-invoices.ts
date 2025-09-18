import sequelize from '../config/dbConfig';
import logger from '../utils/logger';

async function checkEricssonInvoices() {
    try {
        logger.info('Checking Ericsson invoices in database...');

        const [results] = await sequelize.query(`
            SELECT id, invoice_number, items, created_at 
            FROM ericsson_invoices 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        logger.info('Ericsson invoices found:');
        console.log(JSON.stringify(results, null, 2));
        
    } catch (error) {
        logger.error('Error checking Ericsson invoices:', error);
        throw error;
    }
}

// Run the check if this file is executed directly
if (require.main === module) {
    checkEricssonInvoices()
        .then(() => {
            logger.info('Check completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Check failed:', error);
            process.exit(1);
        });
}

export default checkEricssonInvoices; 