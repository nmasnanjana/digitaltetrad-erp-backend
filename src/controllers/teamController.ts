import {Request, Response} from "express";
import Team from "../models/team";
import logger from "../utils/logger";
import { Op } from "sequelize";

class TeamController {
    // Create a new team
    static async createTeam(req: Request, res: Response): Promise<any> {
        try {
            const { name, type, company, leader_id } = req.body;

            // Validate required fields
            if (!name || !type) {
                const msg = "Name and type are required fields";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Validate company field for external teams
            if (type === 'external' && !company) {
                const msg = "Company field is required for external teams";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Validate leader_id for internal teams
            if (type === 'internal' && !leader_id) {
                const msg = "Team leader is required for internal teams";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const newTeam = await Team.create({
                name,
                type,
                company,
                leader_id: type === 'internal' ? leader_id : null
            });

            const msg = `New team created - ${newTeam.name}`;
            logger.info(msg);
            return res.status(201).send({info: msg, team: newTeam});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while creating the team';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get all teams with pagination and search
    static async getAllTeams(req: Request, res: Response): Promise<any> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';
            
            const offset = (page - 1) * limit;
            
            // Build where clause for search
            const whereClause: any = {};
            if (search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { type: { [Op.like]: `%${search}%` } },
                    { company: { [Op.like]: `%${search}%` } }
                ];
            }
            
            // Get total count for pagination
            const totalCount = await Team.count({ where: whereClause });
            
            // Get teams with pagination
            const teams = await Team.findAll({
                where: whereClause,
                include: [{
                    association: 'leader',
                    attributes: ['id', 'firstName', 'lastName', 'username']
                }],
                order: [["name", "ASC"]],
                limit,
                offset
            });
            
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            
            res.json({
                teams,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage,
                    hasPrevPage
                }
            });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while fetching teams";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get team by ID
    static async getTeamById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const team = await Team.findByPk(id, {
                include: [{
                    association: 'leader',
                    attributes: ['id', 'firstName', 'lastName', 'username']
                }]
            });

            if (!team) {
                return res.status(404).send({error: 'Team not found'});
            }
            return res.status(200).json(team);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while fetching the team";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Update team
    static async updateTeam(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { name, type, company, leader_id } = req.body;

            const team = await Team.findByPk(id);
            if (!team) {
                return res.status(404).send({error: 'Team not found'});
            }

            // Validate company field for external teams
            if (type === 'external' && !company) {
                const msg = "Company field is required for external teams";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Validate leader_id for internal teams
            if (type === 'internal' && !leader_id) {
                const msg = "Team leader is required for internal teams";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            await team.update({
                name,
                type,
                company,
                leader_id: type === 'internal' ? leader_id : null
            });

            const msg = `Team ${team.name} updated successfully`;
            logger.info(msg);
            return res.status(200).send({info: msg, team});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while updating the team";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete team
    static async deleteTeam(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const team = await Team.findByPk(id);

            if (!team) {
                return res.status(404).send({error: 'Team not found'});
            }

            await team.destroy();
            const msg = `Team ${team.name} deleted successfully`;
            logger.info(msg);
            return res.status(200).send({info: msg});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while deleting the team";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

export default TeamController;
