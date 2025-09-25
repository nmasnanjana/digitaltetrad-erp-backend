import sequelize from '../config/dbConfig';
import logger from '../utils/logger';

async function addSslColumn() {
  try {
    // Add SSL percentage column to settings table
    await sequelize.query(`
      ALTER TABLE settings 
      ADD COLUMN ssl_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 
      AFTER vat_percentage
    `);
    
    logger.info('Successfully added ssl_percentage column to settings table');
    
    // Update existing records to have default SSL percentage
    await sequelize.query(`
      UPDATE settings 
      SET ssl_percentage = 0.00 
      WHERE ssl_percentage IS NULL
    `);
    
    logger.info('Successfully updated existing settings records with default SSL percentage');
    
  } catch (error) {
    logger.error('Error adding SSL column:', error);
    throw error;
  }
}

// Run the migration
addSslColumn()
  .then(() => {
    logger.info('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Migration failed:', error);
    process.exit(1);
  }); 