import {Request, Response} from "express";
import Job from "../models/job";
import logger from "../utils/logger";
import { Op } from 'sequelize';

class JobController {
    // Create a new job
    static async createJob(req: Request, res: Response): Promise<any> {
        try {
            const { id, name, type, team_id, customer_id } = req.body;

            // Check if job ID already exists
            const existingJob = await Job.findByPk(id);
            if (existingJob) {
                return res.status(400).send({ error: 'Job ID already exists' });
            }

            // Validate required fields
            if (!id || !name || !type || !team_id || !customer_id) {
                return res.status(400).send({ error: 'Required fields are missing' });
            }

            const newJob = await Job.create({
                id,
                name,
                status: 'open',
                type,
                team_id,
                customer_id
            });

            logger.info(`New job created with ID: ${newJob.id}`);
            return res.status(201).json(newJob);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while creating the job';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get all jobs with pagination and filters
    static async getAllJobs(req: Request, res: Response): Promise<any> {
        try {
            const {
                createdStartDate,
                createdEndDate,
                completedStartDate,
                completedEndDate,
                status,
                type,
                customer_id,
                page,
                limit,
                search
            } = req.query;

            const currentPage = parseInt(page as string) || 1;
            const itemsPerPage = parseInt(limit as string) || 10;
            const offset = (currentPage - 1) * itemsPerPage;

            const where: any = {};

            // Filter by created date range
            if (createdStartDate || createdEndDate) {
                where.createdAt = {};
                if (createdStartDate) {
                    // Set start date to beginning of day
                    const startDate = new Date(createdStartDate as string);
                    startDate.setHours(0, 0, 0, 0);
                    where.createdAt[Op.gte] = startDate;
                }
                if (createdEndDate) {
                    // Set end date to end of day
                    const endDate = new Date(createdEndDate as string);
                    endDate.setHours(23, 59, 59, 999);
                    where.createdAt[Op.lte] = endDate;
                }
            }

            // Filter by completed date range
            if (completedStartDate || completedEndDate) {
                where.completed_at = {};
                if (completedStartDate) {
                    // Set start date to beginning of day
                    const startDate = new Date(completedStartDate as string);
                    startDate.setHours(0, 0, 0, 0);
                    where.completed_at[Op.gte] = startDate;
                }
                if (completedEndDate) {
                    // Set end date to end of day
                    const endDate = new Date(completedEndDate as string);
                    endDate.setHours(23, 59, 59, 999);
                    where.completed_at[Op.lte] = endDate;
                }
            }

            // Filter by status
            if (status) {
                where.status = status;
            }

            // Filter by type
            if (type) {
                where.type = type;
            }

            // Filter by customer
            if (customer_id) {
                where.customer_id = customer_id;
            }

            // Add search functionality
            if (search) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { id: { [Op.like]: `%${search}%` } }
                ];
            }

            // Get total count for pagination
            const totalCount = await Job.count({ where });

            const jobs = await Job.findAll({
                where,
                include: [
                    { model: Job.sequelize?.models.Team, as: 'team' },
                    { model: Job.sequelize?.models.Customer, as: 'customer' }
                ],
                order: [["createdAt", "DESC"]],
                limit: itemsPerPage,
                offset
            });

            const totalPages = Math.ceil(totalCount / itemsPerPage);
            const hasNextPage = currentPage < totalPages;
            const hasPrevPage = currentPage > 1;

            res.json({
                jobs,
                pagination: {
                    currentPage,
                    totalPages,
                    totalCount,
                    limit: itemsPerPage,
                    hasNextPage,
                    hasPrevPage
                }
            });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while fetching jobs';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Get job by ID
    static async getJobById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const job = await Job.findByPk(id, {
                include: [
                    { model: Job.sequelize?.models.Team, as: 'team' },
                    { model: Job.sequelize?.models.Customer, as: 'customer' }
                ]
            });

            if (!job) {
                return res.status(404).send({ error: 'Job not found' });
            }
            return res.status(200).json(job);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while fetching the job';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Update job
    static async updateJob(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { name, type, team_id, customer_id, status } = req.body;

            const job = await Job.findByPk(id);
            if (!job) {
                return res.status(404).send({ error: 'Job not found' });
            }

            const updateData: any = {};

            // Only validate and update fields that are provided
            if (name !== undefined) {
                if (!name) {
                    return res.status(400).send({ error: 'Job name is required' });
                }
                updateData.name = name;
            }

            if (type !== undefined) {
                if (!type) {
                    return res.status(400).send({ error: 'Job type is required' });
                }
                updateData.type = type;
            }

            if (team_id !== undefined) {
                if (!team_id) {
                    return res.status(400).send({ error: 'Team ID is required' });
                }
                updateData.team_id = team_id;
            }

            if (customer_id !== undefined) {
                if (!customer_id) {
                    return res.status(400).send({ error: 'Customer ID is required' });
                }
                updateData.customer_id = customer_id;
            }

            if (status !== undefined) {
                updateData.status = status;
                // If status is being updated to 'closed', set completed_at
                if (status === 'closed' && job.status !== 'closed') {
                    updateData.completed_at = new Date();
                }
            }

            await job.update(updateData);

            // Fetch the updated job with all associations
            const updatedJob = await Job.findByPk(id, {
                include: [
                    { model: Job.sequelize?.models.Team, as: 'team' },
                    { model: Job.sequelize?.models.Customer, as: 'customer' }
                ]
            });

            logger.info(`Job ${id} updated successfully`);
            return res.status(200).json(updatedJob);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while updating the job';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }

    // Delete job
    static async deleteJob(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const job = await Job.findByPk(id);

            if (!job) {
                return res.status(404).send({ error: 'Job not found' });
            }

            await job.destroy();
            logger.info(`Job ${id} deleted successfully`);
            return res.status(200).send({ info: 'Job deleted successfully' });
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({ error: e.message });
            } else {
                const msg = 'An unknown server error occurred while deleting the job';
                logger.error(msg);
                return res.status(500).send({ error: msg });
            }
        }
    }
}

export default JobController; 