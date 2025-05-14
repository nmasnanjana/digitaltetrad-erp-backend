import {Request, Response} from "express";
import Job from "../models/job";
import logger from "../utils/logger";

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

    // Get all jobs
    static async getAllJobs(req: Request, res: Response): Promise<any> {
        try {
            const jobs = await Job.findAll({
                include: [
                    { model: Job.sequelize?.models.Team, as: 'team' },
                    { model: Job.sequelize?.models.Customer, as: 'customer' }
                ]
            });
            return res.status(200).json(jobs);
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
            const { name, type, team_id, customer_id } = req.body;

            const job = await Job.findByPk(id);
            if (!job) {
                return res.status(404).send({ error: 'Job not found' });
            }

            // Validate required fields
            if (!name || !type || !team_id || !customer_id) {
                return res.status(400).send({ error: 'Required fields are missing' });
            }

            await job.update({
                name,
                type,
                team_id,
                customer_id
            });

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