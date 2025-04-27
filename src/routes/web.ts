import express from "express";
import userRoute from "./userRoute";
import teamRoute from "./teamRoute";
import teamAssignmentRoute from "./teamAssignmentRoute";

const router = express.Router();

router.use("/users", userRoute);
router.use("/teams", teamRoute);
router.use("/team-assignments", teamAssignmentRoute);

export default router;