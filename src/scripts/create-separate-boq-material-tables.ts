import sequelize from '../config/dbConfig';
import logger from '../utils/logger';

async function createSeparateBoqMaterialTables() {
    try {
        logger.info('Creating separate BOQ material tables...');

        // Create ericsson_boq_remove_materials table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS ericsson_boq_remove_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                boq_id INT NOT NULL,
                sl_no VARCHAR(255) NOT NULL,
                material_description TEXT NOT NULL,
                qty VARCHAR(255) NOT NULL,
                remarks TEXT,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                uploaded_by VARCHAR(36),
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                FOREIGN KEY (boq_id) REFERENCES ericsson_boqs(id) ON DELETE CASCADE
            )
        `);
        logger.info('Created ericsson_boq_remove_materials table');

        // Create ericsson_boq_surplus_materials table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS ericsson_boq_surplus_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                boq_id INT NOT NULL,
                sl_no VARCHAR(255) NOT NULL,
                material_description TEXT NOT NULL,
                qty VARCHAR(255) NOT NULL,
                remarks TEXT,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                uploaded_by VARCHAR(36),
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                FOREIGN KEY (boq_id) REFERENCES ericsson_boqs(id) ON DELETE CASCADE
            )
        `);
        logger.info('Created ericsson_boq_surplus_materials table');

        // Drop the old ericsson_boq_materials table if it exists
        await sequelize.query(`DROP TABLE IF EXISTS ericsson_boq_materials`);
        logger.info('Dropped old ericsson_boq_materials table');

        logger.info('Successfully created separate BOQ material tables');
    } catch (error) {
        logger.error('Error creating separate BOQ material tables:', error);
        throw error;
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    createSeparateBoqMaterialTables()
        .then(() => {
            logger.info('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Migration failed:', error);
            process.exit(1);
        });
}

export default createSeparateBoqMaterialTables; 