import express from "express";
import TeamController from "../controllers/teamController";

const router = express.Router();

// Create a new team
router.post("/", TeamController.createTeam);

// Get all teams
router.get("/", TeamController.getAllTeams);

// Get team by ID
router.get("/:id", TeamController.getTeamById);

// Update team
router.put("/:id", TeamController.updateTeam);

// Delete team
router.delete("/:id", TeamController.deleteTeam);

export default router; 