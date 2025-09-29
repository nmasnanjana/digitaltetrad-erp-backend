import { Router } from 'express';
import ZteInvoiceController from '../controllers/zteInvoiceController';
import { checkPermission } from '../middleware/checkPermission';

const router = Router();

// Create invoice
router.post('/', checkPermission('zteinvoice', 'create'), ZteInvoiceController.createInvoice);

// Get all invoices with pagination
router.get('/', checkPermission('zteinvoice', 'read'), ZteInvoiceController.getAllInvoices);

// Get invoice by ID
router.get('/:id', checkPermission('zteinvoice', 'read'), ZteInvoiceController.getInvoiceById);

// Get invoices by invoice number
router.get('/invoice/:invoice_no', checkPermission('zteinvoice', 'read'), ZteInvoiceController.getInvoicesByInvoiceNumber);

// Get invoice summary by invoice number
router.get('/summary/:invoice_no', checkPermission('zteinvoice', 'read'), ZteInvoiceController.getInvoiceSummary);

// Delete invoice by ID
router.delete('/:id', checkPermission('zteinvoice', 'delete'), ZteInvoiceController.deleteInvoice);

export default router;

