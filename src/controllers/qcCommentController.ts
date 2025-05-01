import {Request, Response} from "express";
import QCComment from "../models/qcComment";
import logger from "../utils/logger";

class QCCommentController {
    // Create a new QC comment
    static async createQCComment(req: Request, res: Response): Promise<any> {
        try {
            const { job_id, description } = req.body;

            // Validate required fields
            if (!job_id || !description) {
                const msg = "Job ID and description are required fields";
                logger.warn(msg);
                return res.status(400).send({error: msg});
            }

            const newComment = await QCComment.create({
                job_id,
                description
            });

            const msg = `New QC comment created for job ${job_id}`;
            logger.info(msg);
            return res.status(201).send({info: msg, comment: newComment});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = 'An unknown server error occurred while creating the QC comment';
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get all QC comments
    static async getAllQCComments(req: Request, res: Response): Promise<any> {
        try {
            const comments = await QCComment.findAll({
                include: [{
                    association: 'job',
                    attributes: ['id', 'name', 'status']
                }]
            });
            return res.status(200).json(comments);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while fetching QC comments";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get QC comments by job ID
    static async getQCCommentsByJobId(req: Request, res: Response): Promise<any> {
        try {
            const { job_id } = req.params;
            const comments = await QCComment.findAll({
                where: { job_id },
                include: [{
                    association: 'job',
                    attributes: ['id', 'name', 'status']
                }]
            });
            return res.status(200).json(comments);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while fetching QC comments for the job";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Get QC comment by ID
    static async getQCCommentById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const comment = await QCComment.findByPk(id, {
                include: [{
                    association: 'job',
                    attributes: ['id', 'name', 'status']
                }]
            });

            if (!comment) {
                return res.status(404).send({error: 'QC comment not found'});
            }
            return res.status(200).json(comment);
        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while fetching the QC comment";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Update QC comment
    static async updateQCComment(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { description } = req.body;

            const comment = await QCComment.findByPk(id);
            if (!comment) {
                return res.status(404).send({error: 'QC comment not found'});
            }

            await comment.update({
                description
            });

            const msg = `QC comment updated successfully`;
            logger.info(msg);
            return res.status(200).send({info: msg, comment});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while updating the QC comment";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }

    // Delete QC comment
    static async deleteQCComment(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const comment = await QCComment.findByPk(id);

            if (!comment) {
                return res.status(404).send({error: 'QC comment not found'});
            }

            await comment.destroy();
            const msg = `QC comment deleted successfully`;
            logger.info(msg);
            return res.status(200).send({info: msg});

        } catch (e: unknown) {
            if (e instanceof Error) {
                logger.error(e.message);
                return res.status(500).send({error: e.message});
            } else {
                const msg = "An unknown server error occurred while deleting the QC comment";
                logger.error(msg);
                return res.status(500).send({error: msg});
            }
        }
    }
}

export default QCCommentController; 