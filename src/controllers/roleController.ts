import { Request, Response } from "express";
import Role from "../models/role";
import User from "../models/user";
import logger from "../utils/logger";

class RoleController {
    // Create a new role
    static async createRole(req: Request, res: Response): Promise<any> {
        try {
            const { name, description } = req.body;

            if (!name) {
                let msg: string = "Role name is required";
                logger.warn(msg);
                return res.status(400).send({ error: msg });
            }

            const newRole = await Role.create({
                name,
                description,
            });

            let msg: string = `New role created - ${newRole.name}`;
            logger.info(msg);
            return res.status(201).send({ info: msg, data: newRole });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                let msg: string = 'An unknown Server error occurred while creating the role';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get all roles
    static async getAllRoles(req: Request, res: Response): Promise<any> {
        try {
            const roles = await Role.findAll({
                include: [{
                    model: User,
                    as: 'users',
                    attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'isActive'],
                }],
            });

            return res.status(200).json(roles);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                let msg: string = "An unknown Server error occurred while fetching the roles";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get role by ID
    static async getRoleByID(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const role = await Role.findByPk(id, {
                include: [{
                    model: User,
                    as: 'users',
                    attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'isActive'],
                }],
            });

            if (!role) return res.status(404).send({ error: 'Role not found' });
            return res.status(200).json(role);

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                let msg: string = "An unknown Server error occurred while fetching the role";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Delete a role
    static async deleteRoleByID(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const role = await Role.findByPk(id);

            if (!role) return res.status(404).send({ error: 'Role not found' });

            // Check if any users are assigned to this role
            const usersWithRole = await User.count({ where: { roleId: id } });
            if (usersWithRole > 0) {
                return res.status(400).send({ error: 'Cannot delete role that is assigned to users' });
            }

            await role.destroy();
            let msg: string = `Role ${role.name} deleted successfully`;
            logger.info(msg);
            return res.status(200).send({ info: msg });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                let msg: string = "An unknown Server error occurred while trying to delete the role";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Update a role
    static async updateRoleByID(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { name, description, isActive } = req.body;

            const role = await Role.findByPk(id);
            if (!role) return res.status(404).send({ error: 'Role not found' });

            await role.update({
                name,
                description,
                isActive,
            });

            await role.save();
            return res.status(200).send({ info: "Role updated successfully", data: role });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                let msg: string = "An unknown Server error occurred while trying to update the role";
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }
}

export default RoleController; 