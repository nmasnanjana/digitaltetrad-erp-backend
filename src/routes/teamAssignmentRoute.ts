import express from "express";
import TeamAssignmentController from "../controllers/teamAssignmentController";

const router = express.Router();

// Create a new team assignment
router.post("/", TeamAssignmentController.createTeamAssignment);

// Get all team assignments
router.get("/", TeamAssignmentController.getAllTeamAssignments);

// Get team assignment by ID
router.get("/:id", TeamAssignmentController.getTeamAssignmentById);

// Update team assignment
router.put("/:id", TeamAssignmentController.updateTeamAssignment);

// Delete team assignment
router.delete("/:id", TeamAssignmentController.deleteTeamAssignment);

export default router; 