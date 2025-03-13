import {Request, Response, RequestHandler} from "express";
import User from "../models/user";
import logger from "../utils/logger";
import bcrypt = require("bcrypt");
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const TOKEN_EXPIRY = "30d";

class UserController {
    // create a new user
    static async createUser (req: Request, res: Response): Promise<any> {
        try {
            const { firstName, lastName, username, password, password_confirmation, role, email } = req.body;
            let hashPassword;

            if (firstName == undefined || username == undefined || password == undefined || password_confirmation == undefined || role == undefined) {
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
                    role: role,
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

    // get all registered users and their roles
    static async getAllUsers(req: Request, res: Response): Promise<any> {
        try {

            const users = await User.findAll({
                attributes: ['id', 'firstName', 'lastName', 'username', 'role'],
            });

            return res.status(200).json(users);

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
                attributes: ['id', 'firstName', 'lastName', 'username', 'role', 'email'],
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
            const { firstName, lastName, username, role, email } = req.body;

            const user = await User.findByPk(id)
            if (!user) return res.status(404).send({error: 'User not found'})

            await user.update({
                firstName: firstName,
                lastName: lastName,
                username: username,
                role: role,
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
    static async userLogin(req:Request, res: Response): Promise<any> {
        try {

            const { username, password } = req.body;

            // Check if user exists
            const user = await User.findOne({ where: { username } });
            if (!user) {
                logger.warn(`Login attempt failed: User '${username}' not found`);
                return res.status(404).send({ error: "Username or Password is incorrect" });
            }

            // Check if user is active
            if (!user.isActive) {
                logger.warn(`Inactive user '${username}' attempted to log in`);
                return res.status(403).send({ error: "Account is inactive. Contact the system administrator." });
            }

            // Check password
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                logger.warn(`Invalid login attempt for user '${username}'`);
                return res.status(404).send({ error: "Username or Password is incorrect" });
            }

            // Update last login time
            user.lastLogin = new Date();
            await user.save();

            // Generate JWT token
            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

            logger.info(`User '${username}' logged in successfully`);
            return res.status(200).send({ token });

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else  {
                let msg:string = "An unknown Server error occurred while trying to login"
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
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

}

export default UserController;