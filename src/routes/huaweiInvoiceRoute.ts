import express from "express";
import HuaweiInvoiceController from "../controllers/huaweiInvoiceController";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

// Create a new Huawei invoice
router.post("/", checkPermission("huaweiinvoice", "create"), HuaweiInvoiceController.createHuaweiInvoice);

// Get all Huawei invoices
router.get("/", checkPermission("huaweiinvoice", "read"), HuaweiInvoiceController.getAllHuaweiInvoices);

// Get Huawei invoice by ID
router.get("/:id", checkPermission("huaweiinvoice", "read"), HuaweiInvoiceController.getHuaweiInvoiceByID);

// Get Huawei invoices by invoice number
router.get("/invoice/:invoice_no", checkPermission("huaweiinvoice", "read"), HuaweiInvoiceController.getHuaweiInvoicesByInvoiceNo);

// Update a Huawei invoice
router.put("/:id", checkPermission("huaweiinvoice", "update"), HuaweiInvoiceController.updateHuaweiInvoiceByID);

// Delete a Huawei invoice
router.delete("/:id", checkPermission("huaweiinvoice", "delete"), HuaweiInvoiceController.deleteHuaweiInvoiceByID);

export default router; 