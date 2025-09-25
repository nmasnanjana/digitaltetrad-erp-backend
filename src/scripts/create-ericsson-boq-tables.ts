import sequelize from '../config/dbConfig';
import logger from '../utils/logger';

async function createEricssonBoqTables() {
    try {
        // Drop existing tables if they exist (to recreate with correct structure)
        await sequelize.query(`DROP TABLE IF EXISTS ericsson_boq_materials`);
        await sequelize.query(`DROP TABLE IF EXISTS ericsson_boq_items`);
        await sequelize.query(`DROP TABLE IF EXISTS ericsson_boqs`);

        // Create ericsson_boqs table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS ericsson_boqs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                job_id VARCHAR(255) NOT NULL UNIQUE,
                project VARCHAR(500) NOT NULL,
                site_id VARCHAR(255) NOT NULL,
                site_name VARCHAR(500) NOT NULL,
                purchase_order_number VARCHAR(255) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                uploaded_by CHAR(36),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_job_id (job_id),
                INDEX idx_uploaded_by (uploaded_by)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Create ericsson_boq_items table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS ericsson_boq_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                boq_id INT NOT NULL,
                service_number VARCHAR(255) NOT NULL,
                item_description TEXT NOT NULL,
                uom VARCHAR(50) NOT NULL,
                qty DECIMAL(10,2) NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
                total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
                is_additional_work BOOLEAN NOT NULL DEFAULT FALSE,
                rate_card_id INT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                uploaded_by CHAR(36),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_boq_id (boq_id),
                INDEX idx_service_number (service_number),
                INDEX idx_rate_card_id (rate_card_id),
                INDEX idx_uploaded_by (uploaded_by),
                FOREIGN KEY (boq_id) REFERENCES ericsson_boqs(id) ON DELETE CASCADE,
                FOREIGN KEY (rate_card_id) REFERENCES ericsson_rate_cards(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Create ericsson_boq_materials table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS ericsson_boq_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                boq_id INT NOT NULL,
                sl_no VARCHAR(255) NOT NULL,
                material_description TEXT NOT NULL,
                qty VARCHAR(255) NOT NULL,
                remarks TEXT,
                material_type ENUM('removal', 'surplus') NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                uploaded_by CHAR(36),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_boq_id (boq_id),
                INDEX idx_material_type (material_type),
                INDEX idx_uploaded_by (uploaded_by),
                FOREIGN KEY (boq_id) REFERENCES ericsson_boqs(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        logger.info('Ericsson BOQ tables created successfully');
        console.log('✅ Ericsson BOQ tables created successfully');
        
    } catch (error) {
        logger.error('Error creating Ericsson BOQ tables:', error);
        console.error('❌ Error creating Ericsson BOQ tables:', error);
        throw error;
    }
}

// Run the migration
createEricssonBoqTables()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    }); 