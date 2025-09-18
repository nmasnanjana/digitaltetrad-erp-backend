import sequelize from '../config/dbConfig';
import logger from '../utils/logger';

async function addInvoicedPercentageToEricssonBoqItems() {
    try {
        logger.info('Adding invoiced_percentage column to ericsson_boq_items table...');

        await sequelize.query(`
            ALTER TABLE ericsson_boq_items 
            ADD COLUMN invoiced_percentage DECIMAL(5,2) NOT NULL DEFAULT 0
        `);
        
        logger.info('Added invoiced_percentage column to ericsson_boq_items table successfully');
    } catch (error) {
        logger.error('Error adding invoiced_percentage column to ericsson_boq_items table:', error);
        throw error;
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    addInvoicedPercentageToEricssonBoqItems()
        .then(() => {
            logger.info('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Migration failed:', error);
            process.exit(1);
        });
}

export default addInvoicedPercentageToEricssonBoqItems; 