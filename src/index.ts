import express from 'express';
import logger from './utils/logger';
import dotenv from 'dotenv';
import sequelize from './config/dbConfig';
import webRoutes from './routes/web';
import cors from 'cors';
import { setupAssociations } from './models/associations';
import { PermissionScanner } from './services/permissionScanner';
import Role from './models/role';
import Permission from './models/permission';
import RolePermission from './models/rolePermission';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4575;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api', webRoutes);

// Custom sync function to handle tables individually
async function customSync() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        
        // Get all table names
        const tables = await queryInterface.showAllTables();
        logger.info(`Found ${tables.length} existing tables`);
        
        // Check if huawei_pos table exists
        const huaweiPosExists = tables.includes('huawei_pos');
        
        if (!huaweiPosExists) {
            logger.info('Creating huawei_pos table...');
            
            // Try selective sync for new tables only
            await sequelize.sync({ 
                alter: false, 
                force: false,
                match: /huawei_pos/ 
            });
            logger.info('huawei_pos table created successfully via selective sync');
        } else {
            logger.info('huawei_pos table already exists');
        }
        
        // For existing tables, don't alter them to avoid index issues
        logger.info('Skipping alteration of existing tables to preserve indexes');
        
    } catch (error) {
        logger.error('Error in custom sync:', error);
        throw error;
    }
}

// Function to create developer role and assign permissions
async function setupDeveloperRole() {
    try {
        // Check if developer role exists
        let developerRole = await Role.findOne({ where: { name: 'developer' } });
        
        if (!developerRole) {
            // Create developer role if it doesn't exist
            developerRole = await Role.create({
                name: 'developer',
                description: 'Developer role with all permissions',
                isActive: true
            });
            logger.info('Created developer role');
        }

        // Get all active permissions
        const permissions = await Permission.findAll({ where: { isActive: true } });
        
        // Remove existing permissions for the role
        await RolePermission.destroy({
            where: { roleId: developerRole.id }
        });

        // Create new role-permission associations
        const rolePermissions = permissions.map(permission => ({
            roleId: developerRole.id,
            permissionId: permission.id
        }));

        await RolePermission.bulkCreate(rolePermissions);
        logger.info(`Assigned ${permissions.length} permissions to developer role`);
    } catch (error) {
        logger.error('Error setting up developer role:', error);
        throw error;
    }
}

// Start server
const startServer = async () => {
    try {
        await sequelize.authenticate();
        logger.info("Database authenticated successfully.");

        // Set up model associations
        setupAssociations();
        logger.info("Model associations set up successfully.");

        // Use custom sync to avoid index issues
        // await customSync();
        // logger.info("Database synchronized successfully using custom sync.");

        // Then scan and sync permissions
        const scanner = new PermissionScanner();
        await scanner.scanControllers();
        await scanner.syncPermissions();
        logger.info("Permissions scanned and synced successfully.");

        // Setup developer role with all permissions
        await setupDeveloperRole();
        logger.info("Developer role setup completed.");

        app.listen(PORT, () => {
            logger.info(`Server running at http://localhost:${PORT}`);
        }).on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                logger.error(`Port ${PORT} is already in use. Please try a different port or kill the process using this port.`);
                process.exit(1);
            } else {
                logger.error('Error starting server:', err);
                process.exit(1);
            }
        });
    } catch (e: unknown) {
        logger.error('Error starting server:', e);
        process.exit(1);
    }
};

startServer();
