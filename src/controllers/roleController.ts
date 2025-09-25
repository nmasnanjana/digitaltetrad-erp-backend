import { Request, Response } from "express";
import Role from "../models/role";
import Permission from "../models/permission";
import logger from "../utils/logger";
import { Op } from "sequelize";

class RoleController {
    // Get all roles with pagination and search
    static async getAllRoles(req: Request, res: Response): Promise<any> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';
            
            const offset = (page - 1) * limit;
            
            // Build where clause for search
            const whereClause: any = { isActive: true };
            if (search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }
            
            // Get total count for pagination
            const totalCount = await Role.count({ where: whereClause });
            
            // Get roles with pagination
            const roles = await Role.findAll({
                include: [{
                    model: Permission,
                    as: 'permissions',
                    where: { isActive: true },
                    required: false
                }],
                where: whereClause,
                order: [["name", "ASC"]],
                limit,
                offset
            });
            
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            
            res.json({
                roles,
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
            logger.error("Error getting roles:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // Get role by ID
    static async getRoleById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const role = await Role.findByPk(id, {
                include: [{
                    model: Permission,
                    as: 'permissions',
                    where: { isActive: true },
                    required: false
                }],
            });

            if (!role) {
                return res.status(404).json({ error: "Role not found" });
            }

            res.json(role);
        } catch (error) {
            logger.error("Error getting role:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // Create new role
    static async createRole(req: Request, res: Response): Promise<any> {
        try {
            const { name, description } = req.body;

            const existingRole = await Role.findOne({ where: { name } });
            if (existingRole) {
                return res.status(400).json({ error: "Role with this name already exists" });
            }

            const roleData = {
                name,
                description,
                isActive: true
            };

            const newRole = await Role.create(roleData);

            res.status(201).json(newRole);
        } catch (error) {
            logger.error("Error creating role:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // Update role
    static async updateRole(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { name, description, isActive } = req.body;

            const role = await Role.findByPk(id);
            if (!role) {
                return res.status(404).json({ error: "Role not found" });
            }

            // Check if name is being changed and if it already exists
            if (name && name !== role.name) {
                const existingRole = await Role.findOne({ where: { name } });
                if (existingRole) {
                    return res.status(400).json({ error: "Role with this name already exists" });
                }
            }

            await role.update({
                name: name || role.name,
                description: description || role.description,
                isActive: isActive !== undefined ? isActive : role.isActive,
            });

            res.json(role);
        } catch (error) {
            logger.error("Error updating role:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // Delete role (soft delete)
    static async deleteRole(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;

            const role = await Role.findByPk(id);
            if (!role) {
                return res.status(404).json({ error: "Role not found" });
            }

            await role.update({ isActive: false });
            res.json({ message: "Role deleted successfully" });
        } catch (error) {
            logger.error("Error deleting role:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

export default RoleController; 