import sequelize from '../config/dbConfig';
import logger from '../utils/logger';

async function addItemsToEricssonInvoices() {
    try {
        logger.info('Adding items column to ericsson_invoices table...');

        await sequelize.query(`
            ALTER TABLE ericsson_invoices 
            ADD COLUMN items JSON NULL
        `);
        
        logger.info('Added items column to ericsson_invoices table successfully');
    } catch (error) {
        logger.error('Error adding items column to ericsson_invoices table:', error);
        throw error;
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    addItemsToEricssonInvoices()
        .then(() => {
            logger.info('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Migration failed:', error);
            process.exit(1);
        });
}

export default addItemsToEricssonInvoices; 