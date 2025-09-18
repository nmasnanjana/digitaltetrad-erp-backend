import express from 'express';
import { EricssonInvoiceController } from '../controllers/ericssonInvoiceController';
import { checkPermission } from '../middleware/checkPermission';

const router = express.Router();

// Create invoice
router.post('/', checkPermission('ericssoninvoice', 'create'), EricssonInvoiceController.createInvoice);

// Get all invoices
router.get('/', checkPermission('ericssoninvoice', 'read'), EricssonInvoiceController.getAllInvoices);

// Get invoice by ID
router.get('/:id', checkPermission('ericssoninvoice', 'read'), EricssonInvoiceController.getInvoiceById);

// Get invoices by job ID
router.get('/job/:jobId', checkPermission('ericssoninvoice', 'read'), EricssonInvoiceController.getInvoicesByJobId);

// Delete invoice
router.delete('/:id', checkPermission('ericssoninvoice', 'delete'), EricssonInvoiceController.deleteInvoice);

export default router; 