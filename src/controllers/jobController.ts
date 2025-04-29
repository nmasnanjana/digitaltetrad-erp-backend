import {Request, Response} from "express";
import Job from "../models/job";
import logger from "../utils/logger";

class JobController {
    // Create a new job
    static async createJob(req: Request, res: Response): Promise<any> {
        try {
            const { name, type, team_id, customer_id } = req.body;

            // Validate required fields
            if (!name || !type || !team_id || !customer_id) {
                const msg = "Name, type, team_id, and customer_id are required fields";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Validate type enum
            if (!['supply and installation', 'installation', 'maintenance'].includes(type)) {
                const msg = "Invalid job type. Must be one of: 'supply and installation', 'installation', 'maintenance'";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const newJob = await Job.create({
                name,
                type,
                team_id,
                customer_id,
                status: 'open' // Default status
            });

            const msg = `New job created - ${newJob.name}`;
            logger.info(msg);
            return res.status(201).send({info: msg, job: newJob});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while creating the job';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get all jobs
    static async getAllJobs(req: Request, res: Response): Promise<any> {
        try {
            const jobs = await Job.findAll({
                include: [
                    {
                        association: 'team',
                        attributes: ['id', 'name', 'type']
                    },
                    {
                        association: 'customer',
                        attributes: ['id', 'name']
                    }
                ]
            });
            return res.status(200).json(jobs);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while fetching jobs";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get job by ID
    static async getJobById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const job = await Job.findByPk(id, {
                include: [
                    {
                        association: 'team',
                        attributes: ['id', 'name', 'type']
                    },
                    {
                        association: 'customer',
                        attributes: ['id', 'name']
                    }
                ]
            });

            if (!job) {
                return res.status(404).send({error: 'Job not found'});
            }
            return res.status(200).json(job);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while fetching the job";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Update job
    static async updateJob(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { name, status, type, team_id, customer_id } = req.body;

            const job = await Job.findByPk(id);
            if (!job) {
                return res.status(404).send({error: 'Job not found'});
            }

            // Validate status enum if provided
            if (status && !['open', 'in progress', 'installed', 'qc', 'pat', 'closed'].includes(status)) {
                const msg = "Invalid status. Must be one of: 'open', 'in progress', 'installed', 'qc', 'pat', 'closed'";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            // Validate type enum if provided
            if (type && !['supply and installation', 'installation', 'maintenance'].includes(type)) {
                const msg = "Invalid job type. Must be one of: 'supply and installation', 'installation', 'maintenance'";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            await job.update({
                name,
                status,
                type,
                team_id,
                customer_id
            });

            const msg = `Job ${job.name} updated successfully`;
            logger.info(msg);
            return res.status(200).send({info: msg, job});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while updating the job";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete job
    static async deleteJob(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const job = await Job.findByPk(id);

            if (!job) {
                return res.status(404).send({error: 'Job not found'});
            }

            await job.destroy();
            const msg = `Job ${job.name} deleted successfully`;
            logger.info(msg);
            return res.status(200).send({info: msg});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while deleting the job";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

export default JobController; 