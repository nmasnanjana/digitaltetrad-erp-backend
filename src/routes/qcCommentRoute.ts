import express from "express";
import QCCommentController from "../controllers/qcCommentController";

const router = express.Router();

// Create a new QC comment
router.post("/", QCCommentController.createQCComment);

// Get all QC comments
router.get("/", QCCommentController.getAllQCComments);

// Get QC comments by job ID
router.get("/job/:job_id", QCCommentController.getQCCommentsByJobId);

// Get QC comment by ID
router.get("/:id", QCCommentController.getQCCommentById);

// Update QC comment
router.put("/:id", QCCommentController.updateQCComment);

// Delete QC comment
router.delete("/:id", QCCommentController.deleteQCComment);

export default router; 