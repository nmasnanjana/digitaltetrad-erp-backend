import sequelize from '../config/dbConfig';
import Permission from '../models/permission';
import Role from '../models/role';
import RolePermission from '../models/rolePermission';
import logger from '../utils/logger';

async function activateAllPermissions() {
    try {
        await sequelize.authenticate();
        logger.info("Database authenticated successfully.");

        // Activate all permissions
        await Permission.update(
            { isActive: true },
            { where: {} }
        );
        logger.info("All permissions activated successfully.");

        // Get the developer role
        const developerRole = await Role.findOne({ where: { name: 'developer' } });
        if (!developerRole) {
            logger.error("Developer role not found");
            return;
        }

        // Get all active permissions
        const permissions = await Permission.findAll({ where: { isActive: true } });
        logger.info(`Found ${permissions.length} active permissions`);

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

        logger.info("Permission activation completed successfully.");
        process.exit(0);
    } catch (error) {
        logger.error('Error activating permissions:', error);
        process.exit(1);
    }
}

activateAllPermissions(); 