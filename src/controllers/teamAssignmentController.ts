import {Request, Response} from "express";
import TeamAssignment from "../models/teamAssignment";
import logger from "../utils/logger";

class TeamAssignmentController {
    // Create a new team assignment
    static async createTeamAssignment(req: Request, res: Response): Promise<any> {
        try {
            const { team_id, user_id } = req.body;

            // Validate required fields
            if (!team_id || !user_id) {
                const msg = "Team ID and User ID are required fields";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const newAssignment = await TeamAssignment.create({
                team_id,
                user_id
            });

            const msg = `New team assignment created`;
            logger.info(msg);
            return res.status(201).send({info: msg, assignment: newAssignment});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while creating the team assignment';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get all team assignments
    static async getAllTeamAssignments(req: Request, res: Response): Promise<any> {
        try {
            const assignments = await TeamAssignment.findAll({
                include: [
                    {
                        association: 'team',
                        attributes: ['id', 'name', 'type']
                    },
                    {
                        association: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'username']
                    }
                ]
            });
            return res.status(200).json(assignments);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while fetching team assignments";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get team assignment by ID
    static async getTeamAssignmentById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const assignment = await TeamAssignment.findByPk(id, {
                include: [
                    {
                        association: 'team',
                        attributes: ['id', 'name', 'type']
                    },
                    {
                        association: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'username']
                    }
                ]
            });

            if (!assignment) {
                return res.status(404).send({error: 'Team assignment not found'});
            }
            return res.status(200).json(assignment);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while fetching the team assignment";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Update team assignment
    static async updateTeamAssignment(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { team_id, user_id } = req.body;

            const assignment = await TeamAssignment.findByPk(id);
            if (!assignment) {
                return res.status(404).send({error: 'Team assignment not found'});
            }

            await assignment.update({
                team_id,
                user_id
            });

            const msg = `Team assignment updated successfully`;
            logger.info(msg);
            return res.status(200).send({info: msg, assignment});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while updating the team assignment";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete team assignment
    static async deleteTeamAssignment(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const assignment = await TeamAssignment.findByPk(id);

            if (!assignment) {
                return res.status(404).send({error: 'Team assignment not found'});
            }

            await assignment.destroy();
            const msg = `Team assignment deleted successfully`;
            logger.info(msg);
            return res.status(200).send({info: msg});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while deleting the team assignment";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

export default TeamAssignmentController;
