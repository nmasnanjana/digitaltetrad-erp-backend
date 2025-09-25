import {Request, Response, RequestHandler} from "express";
import User from "../models/user";
import logger from "../utils/logger";
import bcrypt = require("bcryptjs");
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import Role from "../models/role";
import Permission from "../models/permission";
import { Op } from "sequelize";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const TOKEN_EXPIRY = "30d";

class UserController {
    // create a new user
    static async createUser (req: Request, res: Response): Promise<any> {
        try {
            const { firstName, lastName, username, password, password_confirmation, roleId, email } = req.body;
            let hashPassword;

            if (firstName == undefined || username == undefined || password == undefined || password_confirmation == undefined || roleId == undefined) {
                let msg:string = "One or more user fields required to register a user is absent"
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            if (password === password_confirmation) {
                const newUser = await User.create({
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    password: password,
                    email: email,
                    roleId: roleId,
                });

                let msg:string = `new user created - ${newUser.firstName} ${newUser.lastName ?? ""}`;
                logger.info(msg);
                return res.status(201).send({info: msg});

            } else {
                let msg:string = "Passwords don't match";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else  {
                let msg:string = 'An unknown Server error occurred while creating the user'
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // get all registered users and their roles with pagination
    static async getAllUsers(req: Request, res: Response): Promise<any> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';
            const offset = (page - 1) * limit;
            
            // Build where clause for search
            const whereClause: any = {};
            if (search) {
                whereClause[Op.or] = [
                    { firstName: { [Op.like]: `%${search}%` } },
                    { lastName: { [Op.like]: `%${search}%` } },
                    { username: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ];
            }
            
            // Get total count for pagination
            const totalCount = await User.count({ where: whereClause });
            
            // Get users with pagination
            const users = await User.findAll({
                attributes: ['id', 'firstName', 'lastName', 'username', 'roleId', 'email', 'isActive', 'lastLogin'],
                include: [{
                    model: Role,
                    as: 'role',
                    attributes: ['name']
                }],
                where: whereClause,
                limit: limit,
                offset: offset,
                order: [['createdAt', 'DESC']]
            });

            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            return res.status(200).json({
                users: users,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalCount: totalCount,
                    limit: limit,
                    hasNextPage: hasNextPage,
                    hasPrevPage: hasPrevPage
                }
            });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else  {
                let msg:string = "An unknown Server error occurred while fetching the users"
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // get user by id
    static async getUserByID(req:Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id, {
                attributes: ['id', 'firstName', 'lastName', 'username', 'roleId', 'email', 'isActive', 'lastLogin'],
                include: [{
                    model: Role,
                    as: 'role',
                    attributes: ['name']
                }]
            });

            if (!user) return res.status(404).send({error: 'User not found'});
            return res.status(200).json(user);

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else  {
                let msg:string = "An unknown Server error occurred while fetching the user"
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // delete a user
    static async deleteUserByID(req:Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id)

            if (!user) return res.status(404).send({error: 'User not found'})
            await user.destroy();
            let msg:string = `User ${user.firstName} ${user.lastName ?? ""} deleted successfully`
            logger.info(msg);
            return res.status(200).send({info: msg});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else  {
                let msg:string = "An unknown Server error occurred while trying to delete the user"
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // update a new user
    static async updateUserByID(req:Request, res: Response): Promise<any> {
        try {
            const {id} = req.params;
            const { firstName, lastName, username, roleId, email } = req.body;

            const user = await User.findByPk(id)
            if (!user) return res.status(404).send({error: 'User not found'})

            await user.update({
                firstName: firstName,
                lastName: lastName,
                username: username,
                roleId: roleId,
                email: email,
            });

            await user.save();
            return res.status(200).send({info: "user updated successfully"});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else  {
                let msg:string = "An unknown Server error occurred while trying to update the user"
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // update user password
    static async updateUserPassword(req:Request, res: Response): Promise<any> {
        try {
            const {id} = req.params;
            const { currentPassword, newPassword, newPasswordConfirm } = req.body;

            const user = await User.findByPk(id);
            if (!user) return res.status(404).send({error: 'User not found'})

            if (await bcrypt.compare(currentPassword, user.password) && newPassword == newPasswordConfirm) {
                user.password = newPassword;
                await user.save();

                return res.status(200).send({info: "user password updated successfully"});
            } else {
                return res.status(400).send({info: "current Password not match"});
            }

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else  {
                let msg:string = "An unknown Server error occurred while trying to update the user password"
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // login user
    static async userLogin(req: Request, res: Response): Promise<void> {
        try {
            const { username, password, rememberMe } = req.body;

            // Check if user exists
            const user = await User.findOne({ where: { username } });
            if (!user) {
                logger.warn(`Login attempt failed: User '${username}' not found`);
                res.status(404).json({ error: "Username or Password is incorrect" });
                return;
            }

            // Check if user is active
            if (!user.isActive) {
                logger.warn(`Inactive user '${username}' attempted to log in`);
                res.status(403).json({ error: "Account is inactive. Contact the system administrator." });
                return;
            }

            // Check password
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                logger.warn(`Invalid login attempt for user '${username}'`);
                res.status(404).json({ error: "Username or Password is incorrect" });
                return;
            }

            // Update last login time
            user.lastLogin = new Date();
            await user.save();

            // Generate JWT token with different expiry based on remember me
            const tokenExpiry = rememberMe ? "30d" : "1d";
            const token = jwt.sign({ id: user.id, roleId: user.roleId }, JWT_SECRET, { expiresIn: tokenExpiry });

            // Set cookie options
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict' as const,
                maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days or 1 day
            };

            // Set the token in cookie
            res.cookie('token', token, cookieOptions);

            logger.info(`User '${username}' logged in successfully`);
            logger.info(`Token payload: ${JSON.stringify({ id: user.id, roleId: user.roleId })}`);
            
            res.status(200).json({ 
                token, // Include token in response
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                    roleId: user.roleId,
                    isActive: user.isActive
                }
            });
        } catch (error) {
            logger.error("Login error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // update a new user
    static async updateUserActivity(req:Request, res: Response): Promise<any> {
        try {
            const {id} = req.params;
            const { isActive } = req.body;

            const user = await User.findByPk(id)
            if (!user) return res.status(404).send({error: 'User not found'})

            await user.update({
                isActive: isActive
            });

            await user.save();
            return res.status(200).send({info: "user updated successfully"});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else  {
                let msg:string = "An unknown Server error occurred while trying to update the user"
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    static async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            // Get user ID from the session or JWT token
            const userId = req.user?.id;
            
            if (!userId) {
                res.status(401).json({ message: "Not authenticated" });
                return;
            }

            // Get user with role and permissions
            const user = await User.findByPk(userId, {
                include: [{
                    model: Role,
                    as: 'role',
                    include: [{
                        model: Permission,
                        as: 'permissions',
                        where: { isActive: true },
                        required: false
                    }]
                }]
            });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            // Return user data without sensitive information
            const userData = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                roleId: user.roleId,
                role: user.role,
                isActive: user.isActive,
                lastLogin: user.lastLogin
            };

            res.json(userData);
        } catch (error) {
            logger.error("Error getting current user:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

}

export default UserController;