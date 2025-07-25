import express from "express";
import HuaweiInvoiceController from "../controllers/huaweiInvoiceController";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

// Create invoice records
router.post("/", checkPermission("huaweiinvoice", "create"), HuaweiInvoiceController.createInvoice);

// Get all invoices
router.get("/", checkPermission("huaweiinvoice", "read"), HuaweiInvoiceController.getAllInvoices);

// Get invoice summaries
router.get("/summaries", checkPermission("huaweiinvoice", "read"), HuaweiInvoiceController.getInvoiceSummaries);

// Get invoice by ID
router.get("/:id", checkPermission("huaweiinvoice", "read"), HuaweiInvoiceController.getInvoiceById);

// Get invoices by invoice number
router.get("/invoice/:invoice_no", checkPermission("huaweiinvoice", "read"), HuaweiInvoiceController.getInvoicesByInvoiceNo);

// Update invoice by ID
router.put("/:id", checkPermission("huaweiinvoice", "update"), HuaweiInvoiceController.updateInvoiceById);

// Delete invoice by ID
router.delete("/:id", checkPermission("huaweiinvoice", "delete"), HuaweiInvoiceController.deleteInvoiceById);

// Delete all invoices by invoice number
router.delete("/invoice/:invoice_no", checkPermission("huaweiinvoice", "delete"), HuaweiInvoiceController.deleteInvoicesByInvoiceNo);

export default router; 