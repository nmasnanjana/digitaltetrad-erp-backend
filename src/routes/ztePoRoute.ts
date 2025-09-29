import express from 'express';
import multer from 'multer';
import ZtePoController from '../controllers/ztePoController';
import { checkPermission } from '../middleware/checkPermission';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
        }
    }
});

// Create a new ZTE PO
router.post('/', checkPermission('ztepo', 'create'), ZtePoController.createZtePo);

// Upload Excel file and process ZTE PO data
router.post('/upload-excel', checkPermission('ztepo', 'uploadexcelfile'), upload.single('file'), ZtePoController.uploadExcelFile);

// Get all ZTE POs
router.get('/', checkPermission('ztepo', 'read'), ZtePoController.getAllZtePos);

// Get ZTE PO by ID
router.get('/:id', checkPermission('ztepo', 'read'), ZtePoController.getZtePoById);

// Get ZTE POs by Job ID
router.get('/job/:jobId', checkPermission('ztepo', 'read'), ZtePoController.getZtePosByJobId);

// Update ZTE PO by ID
router.put('/:id', checkPermission('ztepo', 'update'), ZtePoController.updateZtePoById);

// Delete ZTE PO by ID
router.delete('/:id', checkPermission('ztepo', 'delete'), ZtePoController.deleteZtePoById);

// Delete ZTE POs by Job ID
router.delete('/job/:jobId', checkPermission('ztepo', 'delete'), ZtePoController.deleteZtePosByJobId);

// Download ZTE PO file
router.get('/download/:jobId', checkPermission('ztepo', 'downloadexcelfile'), ZtePoController.downloadZtePoFile);

export default router;
