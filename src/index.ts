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
import User from './models/user';

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
        
        // Import all models
        const User = require('./models/user').default;
        const Role = require('./models/role').default;
        const Permission = require('./models/permission').default;
        const RolePermission = require('./models/rolePermission').default;
        const Customer = require('./models/customer').default;
        const Team = require('./models/team').default;
        const TeamAssignment = require('./models/teamAssignment').default;
        const Job = require('./models/job').default;
        const ExpenseType = require('./models/expenseType').default;
        const OperationType = require('./models/operationType').default;
        const Expense = require('./models/expense').default;
        const PurchaseOrder = require('./models/purchaseOrder').default;
        const QCComment = require('./models/qcComment').default;
        const Inventory = require('./models/inventory').default;
        const HuaweiPo = require('./models/huaweiPo').default;
        const HuaweiInvoice = require('./models/huaweiInvoice').default;
        const EricssonRateCard = require('./models/ericssonRateCard').default;
        const Settings = require('./models/settings').default;
        
        // Define table creation order (base tables first, then dependent tables)
        const tableOrder = [
            { name: 'roles', model: Role },
            { name: 'users', model: User },
            { name: 'permissions', model: Permission },
            { name: 'role_permissions', model: RolePermission },
            { name: 'customers', model: Customer },
            { name: 'teams', model: Team },
            { name: 'team_assignments', model: TeamAssignment },
            { name: 'jobs', model: Job },
            { name: 'expense_types', model: ExpenseType },
            { name: 'operation_types', model: OperationType },
            { name: 'expenses', model: Expense },
            { name: 'purchase_orders', model: PurchaseOrder },
            { name: 'qc_comments', model: QCComment },
            { name: 'inventory', model: Inventory },
            { name: 'huawei_pos', model: HuaweiPo },
            { name: 'huawei_invoices', model: HuaweiInvoice },
            { name: 'ericsson_rate_cards', model: EricssonRateCard },
            { name: 'settings', model: Settings }
        ];
        
        // Create or sync tables in order
        for (const table of tableOrder) {
            const tableExists = tables.includes(table.name);
            
            if (!tableExists) {
                logger.info(`Creating ${table.name} table...`);
                await table.model.sync({ force: false });
                logger.info(`${table.name} table created successfully`);
            } else {
                logger.info(`${table.name} table exists, syncing to add missing columns...`);
                await table.model.sync({ alter: true });
                logger.info(`${table.name} table synced successfully`);
            }
        }
        
        logger.info('Custom sync completed successfully');
        
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
        
        return developerRole;
    } catch (error) {
        logger.error('Error setting up developer role:', error);
        throw error;
    }
}

// Function to create default user
async function createDefaultUser(developerRole: any) {
    try {
        // Check if default user already exists
        const existingUser = await User.findOne({ 
            where: { username: 'admin' } 
        });
        
        if (existingUser) {
            logger.info('Default user already exists, skipping creation');
            return;
        }
        
        // Create default user
        const defaultUser = await User.create({
            firstName: 'System',
            lastName: 'Administrator',
            username: 'admin',
            password: 'Admin@123!', // This will be hashed by the User model hooks
            email: 'admin@erp.com',
            roleId: developerRole.id,
            isActive: true
        });
        
        logger.info('Created default user: admin (password: Admin@123!)');
        logger.info('⚠️  IMPORTANT: Change the default password after first login!');
        
    } catch (error) {
        logger.error('Error creating default user:', error);
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
        const developerRole = await setupDeveloperRole();
        logger.info("Developer role setup completed.");

        // Create default user
        await createDefaultUser(developerRole);
        logger.info("Default user setup completed.");

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
