import sequelize from '../config/dbConfig';
import logger from '../utils/logger';

async function createEricssonRateCardsTable() {
  try {
    // Create the ericsson_rate_cards table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ericsson_rate_cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_code VARCHAR(255) NOT NULL,
        product_description TEXT NOT NULL,
        product_rate DECIMAL(10,2) NOT NULL CHECK (product_rate >= 0),
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        uploaded_by CHAR(36),
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_product_code (product_code),
        INDEX idx_uploaded_at (uploaded_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    logger.info('Successfully created ericsson_rate_cards table');
    
  } catch (error) {
    logger.error('Error creating ericsson_rate_cards table:', error);
    throw error;
  }
}

// Run the migration
createEricssonRateCardsTable()
  .then(() => {
    logger.info('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Migration failed:', error);
    process.exit(1);
  }); 