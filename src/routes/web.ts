import express from "express";
import userRoute from "./userRoute";
import teamRoute from "./teamRoute";
import teamAssignmentRoute from "./teamAssignmentRoute";
import customerRoute from "./customerRoute";
import jobRoute from "./jobRoute";
import qcCommentRoute from "./qcCommentRoute";

const router = express.Router();

router.use("/users", userRoute);
router.use("/teams", teamRoute);
router.use("/team-assignments", teamAssignmentRoute);
router.use("/customers", customerRoute);
router.use("/jobs", jobRoute);
router.use("/qc-comments", qcCommentRoute);

export default router;