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
import inventoryRoute from "./inventoryRoute";
import permissionRoute from "./permissionRoutes";
import huaweiPoRoute from "./huaweiPoRoute";
import huaweiInvoiceRoute from "./huaweiInvoiceRoute";
import { checkPermission } from "../middleware/checkPermission";
import { authenticate } from "../middleware/auth";
import UserController from "../controllers/userController";

const router = express.Router();

// Auth routes
router.post("/users/login", UserController.userLogin);

// Protected routes
router.use("/users", authenticate, userRoute);
router.use("/teams", authenticate, teamRoute);
router.use("/team-assignments", authenticate, teamAssignmentRoute);
router.use("/customers", authenticate, customerRoute);
router.use("/jobs", authenticate, jobRoute);
router.use("/qc-comments", authenticate, qcCommentRoute);
router.use("/expenses", authenticate, expenseRoute);
router.use("/expense-types", authenticate, expenseTypeRoute);
router.use("/operation-types", authenticate, operationTypeRoute);
router.use("/roles", authenticate, roleRoute);
router.use("/inventory", authenticate, inventoryRoute);
router.use("/permissions", authenticate, permissionRoute);
router.use("/huawei-pos", authenticate, huaweiPoRoute);
router.use("/huawei-invoices", authenticate, huaweiInvoiceRoute);

export default router;