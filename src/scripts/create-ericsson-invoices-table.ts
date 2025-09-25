import sequelize from '../config/dbConfig';
import logger from '../utils/logger';

async function createEricssonInvoicesTable() {
    try {
        logger.info('Creating Ericsson invoices table...');

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS ericsson_invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_number VARCHAR(255) NOT NULL UNIQUE,
                job_id VARCHAR(255) NOT NULL,
                job_title VARCHAR(255) NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                customer_address TEXT,
                project VARCHAR(255) NOT NULL,
                site_id VARCHAR(255) NOT NULL,
                site_name VARCHAR(255) NOT NULL,
                purchase_order_number VARCHAR(255) NOT NULL,
                subtotal DECIMAL(15,2) NOT NULL,
                vat_amount DECIMAL(15,2) NOT NULL,
                ssl_amount DECIMAL(15,2) NOT NULL,
                total_amount DECIMAL(15,2) NOT NULL,
                vat_percentage DECIMAL(5,2) NOT NULL,
                ssl_percentage DECIMAL(5,2) NOT NULL,
                created_by VARCHAR(36),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL
            )
        `);
        
        logger.info('Created ericsson_invoices table successfully');
    } catch (error) {
        logger.error('Error creating Ericsson invoices table:', error);
        throw error;
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    createEricssonInvoicesTable()
        .then(() => {
            logger.info('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Migration failed:', error);
            process.exit(1);
        });
}

export default createEricssonInvoicesTable; 