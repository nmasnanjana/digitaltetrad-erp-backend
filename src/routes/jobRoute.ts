import express from "express";
import JobController from "../controllers/jobController";

const router = express.Router();

// Create a new job
router.post("/", JobController.createJob);

// Get all jobs
router.get("/", JobController.getAllJobs);

// Get job by ID
router.get("/:id", JobController.getJobById);

// Update job
router.put("/:id", JobController.updateJob);

// Delete job
router.delete("/:id", JobController.deleteJob);

export default router; 