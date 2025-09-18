import { Request, Response } from 'express';
import Permission from '../models/permission';
import Role from '../models/role';
import RolePermission from '../models/rolePermission';
import { PermissionScanner } from '../services/permissionScanner';
import logger from '../utils/logger';
import { Op } from 'sequelize';

class PermissionController {
    // Get all permissions with pagination and search
    static async getAllPermissions(req: Request, res: Response): Promise<any> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';
            
            const offset = (page - 1) * limit;
            
            // Build where clause for search
            const whereClause: any = { isActive: true };
            if (search) {
                whereClause[Op.or] = [
                    { module: { [Op.like]: `%${search}%` } },
                    { action: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }
            
            // Get total count for pagination
            const totalCount = await Permission.count({ where: whereClause });
            
            // Get permissions with pagination
            const permissions = await Permission.findAll({
                where: whereClause,
                order: [['module', 'ASC'], ['action', 'ASC']],
                limit,
                offset
            });
            
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            
            res.json({
                permissions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage,
                    hasPrevPage
                }
            });
        } catch (error) {
            logger.error('Error getting permissions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get permissions by module
    static async getPermissionsByModule(req: Request, res: Response): Promise<any> {
        try {
            const { module } = req.params;
            const permissions = await Permission.findAll({
                where: { module, isActive: true },
                order: [['action', 'ASC']],
            });
            res.json(permissions);
        } catch (error) {
            logger.error('Error getting permissions by module:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Assign permissions to role
    static async assignPermissionsToRole(req: Request, res: Response): Promise<any> {
        try {
            const { roleId } = req.params;
            const { permissionIds } = req.body;

            // Verify role exists
            const role = await Role.findByPk(roleId);
            if (!role) {
                return res.status(404).json({ error: 'Role not found' });
            }

            // Remove existing permissions
            await RolePermission.destroy({
                where: { roleId },
            });

            // Add new permissions
            await RolePermission.bulkCreate(
                permissionIds.map((permissionId: string) => ({
                    roleId,
                    permissionId,
                }))
            );

            res.json({ message: 'Permissions assigned successfully' });
        } catch (error) {
            logger.error('Error assigning permissions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Remove permissions from role
    static async removePermissionsFromRole(req: Request, res: Response): Promise<any> {
        try {
            const { roleId } = req.params;
            const { permissionIds } = req.body;

            await RolePermission.destroy({
                where: {
                    roleId,
                    permissionId: permissionIds,
                },
            });

            res.json({ message: 'Permissions removed successfully' });
        } catch (error) {
            logger.error('Error removing permissions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Scan and sync permissions
    static async scanAndSyncPermissions(req: Request, res: Response): Promise<any> {
        try {
            const scanner = new PermissionScanner();
            await scanner.scanControllers();
            await scanner.syncPermissions();
            res.json({ message: 'Permissions scanned and synced successfully' });
        } catch (error) {
            logger.error('Error scanning and syncing permissions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default PermissionController; 