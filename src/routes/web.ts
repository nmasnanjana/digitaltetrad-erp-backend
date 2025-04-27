import express from "express";
import userRoute from "./userRoute";
import teamRoute from "./teamRoute";
import teamAssignmentRoute from "./teamAssignmentRoute";
import customerRoute from "./customerRoute";

const router = express.Router();

router.use("/users", userRoute);
router.use("/teams", teamRoute);
router.use("/team-assignments", teamAssignmentRoute);
router.use("/customers", customerRoute);

export default router;