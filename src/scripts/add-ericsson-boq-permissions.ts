import sequelize from '../config/dbConfig';
import Permission from '../models/permission';
import Role from '../models/role';
import RolePermission from '../models/rolePermission';
import logger from '../utils/logger';

async function addEricssonBoqPermissions() {
    try {
        await sequelize.authenticate();
        logger.info("Database authenticated successfully.");

        // Define Ericsson BOQ permissions
        const ericssonBoqPermissions = [
            {
                name: 'ericssonboq.read',
                description: 'Permission to read Ericsson BOQ data',
                module: 'ericssonboq',
                action: 'read',
                isActive: true
            },
            {
                name: 'ericssonboq.create',
                description: 'Permission to create Ericsson BOQ data',
                module: 'ericssonboq',
                action: 'create',
                isActive: true
            },
            {
                name: 'ericssonboq.update',
                description: 'Permission to update Ericsson BOQ data',
                module: 'ericssonboq',
                action: 'update',
                isActive: true
            },
            {
                name: 'ericssonboq.delete',
                description: 'Permission to delete Ericsson BOQ data',
                module: 'ericssonboq',
                action: 'delete',
                isActive: true
            },
            {
                name: 'ericssonboq.uploadexcelfile',
                description: 'Permission to upload Excel file for Ericsson BOQ',
                module: 'ericssonboq',
                action: 'uploadexcelfile',
                isActive: true
            }
        ];

        // Create permissions
        for (const permissionData of ericssonBoqPermissions) {
            const [permission, created] = await Permission.findOrCreate({
                where: { name: permissionData.name },
                defaults: permissionData
            });

            if (created) {
                logger.info(`Created permission: ${permissionData.name}`);
            } else {
                logger.info(`Permission already exists: ${permissionData.name}`);
            }
        }

        // Get the developer role
        const developerRole = await Role.findOne({ where: { name: 'developer' } });
        if (!developerRole) {
            logger.error("Developer role not found");
            return;
        }

        // Get all Ericsson BOQ permissions
        const ericssonBoqPerms = await Permission.findAll({
            where: {
                module: 'ericssonboq',
                isActive: true
            }
        });

        // Remove existing Ericsson BOQ permissions for the role
        await RolePermission.destroy({
            where: {
                roleId: developerRole.id,
                permissionId: ericssonBoqPerms.map(p => p.id)
            }
        });

        // Create new role-permission associations
        const rolePermissions = ericssonBoqPerms.map(permission => ({
            roleId: developerRole.id,
            permissionId: permission.id
        }));

        await RolePermission.bulkCreate(rolePermissions);
        logger.info(`Assigned ${rolePermissions.length} Ericsson BOQ permissions to developer role`);

        logger.info("Ericsson BOQ permissions added successfully.");
        process.exit(0);
    } catch (error) {
        logger.error('Error adding Ericsson BOQ permissions:', error);
        process.exit(1);
    }
}

addEricssonBoqPermissions(); 