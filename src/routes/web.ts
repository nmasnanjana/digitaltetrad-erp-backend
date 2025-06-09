import express from "express";
import userRoute from "./userRoute";
import teamRoute from "./teamRoute";
import teamAssignmentRoute from "./teamAssignmentRoute";
import customerRoute from "./customerRoute";
import jobRoute from "./jobRoute";
import qcCommentRoute from "./qcCommentRoute";
import expenseRoute from "./expenseRoute";
import expenseTypeRoute from "./expenseTypeRoute";
import operationTypeRoute from "./operationTypeRoute";
import roleRoute from "./roleRoute";

const router = express.Router();

router.use("/users", userRoute);
router.use("/teams", teamRoute);
router.use("/team-assignments", teamAssignmentRoute);
router.use("/customers", customerRoute);
router.use("/jobs", jobRoute);
router.use("/qc-comments", qcCommentRoute);
router.use("/expenses", expenseRoute);
router.use("/expense-types", expenseTypeRoute);
router.use("/operation-types", operationTypeRoute);
router.use("/roles", roleRoute);

export default router;