import express from "express";
import multer from "multer";
import HuaweiPoController from "../controllers/huaweiPoController";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, '/tmp/'); // Temporary storage
    },
    filename: (req: any, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.xlsx');
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// File upload route
router.post("/upload", 
    upload.single('excel_file'), 
    checkPermission('huawei_po', 'upload'),
    HuaweiPoController.uploadExcelFile
);

// Get file info
router.get("/file-info/:job_id", 
    checkPermission('huawei_po', 'read'),
    HuaweiPoController.getFileInfo
);

// Download file
router.get("/download/:job_id", 
    checkPermission('huawei_po', 'download'),
    HuaweiPoController.downloadExcelFile
);

// CRUD routes
router.post("/", 
    checkPermission('huawei_po', 'create'),
    HuaweiPoController.createHuaweiPo
);

router.get("/", 
    checkPermission('huawei_po', 'read'),
    HuaweiPoController.getAllHuaweiPos
);

router.get("/:id", 
    checkPermission('huawei_po', 'read'),
    HuaweiPoController.getHuaweiPoByID
);

router.get("/job/:job_id", 
    checkPermission('huawei_po', 'read'),
    HuaweiPoController.getHuaweiPosByJobID
);

router.get("/customer/:customer_id", 
    checkPermission('huawei_po', 'read'),
    HuaweiPoController.getHuaweiPosByCustomerID
);

router.get("/po/:po_no", 
    checkPermission('huawei_po', 'read'),
    HuaweiPoController.getHuaweiPosByPONumber
);

router.put("/:id", 
    checkPermission('huawei_po', 'update'),
    HuaweiPoController.updateHuaweiPoByID
);

router.delete("/:id", 
    checkPermission('huawei_po', 'delete'),
    HuaweiPoController.deleteHuaweiPoByID
);

export default router; 