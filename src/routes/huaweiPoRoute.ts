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
    checkPermission('huaweipo', 'uploadexcelfile'),
    HuaweiPoController.uploadExcelFile
);

// Get file info
router.get("/file-info/:job_id", 
    checkPermission('huaweipo', 'read'),
    HuaweiPoController.getFileInfo
);

// Download file
router.get("/download/:job_id", 
    checkPermission('huaweipo', 'downloadexcelfile'),
    HuaweiPoController.downloadExcelFile
);

// CRUD routes
router.post("/", 
    checkPermission('huaweipo', 'create'),
    HuaweiPoController.createHuaweiPo
);

router.get("/", 
    checkPermission('huaweipo', 'read'),
    HuaweiPoController.getAllHuaweiPos
);

router.get("/:id", 
    checkPermission('huaweipo', 'read'),
    HuaweiPoController.getHuaweiPoByID
);

router.get("/job/:job_id", 
    checkPermission('huaweipo', 'read'),
    HuaweiPoController.getHuaweiPosByJobID
);

router.delete("/job/:job_id", 
    checkPermission('huaweipo', 'delete'),
    HuaweiPoController.deleteHuaweiPosByJobID
);

router.get("/customer/:customer_id", 
    checkPermission('huaweipo', 'read'),
    HuaweiPoController.getHuaweiPosByCustomerID
);

router.get("/po/:po_no", 
    checkPermission('huaweipo', 'read'),
    HuaweiPoController.getHuaweiPosByPONumber
);

router.put("/:id", 
    checkPermission('huaweipo', 'update'),
    HuaweiPoController.updateHuaweiPoByID
);

router.delete("/:id", 
    checkPermission('huaweipo', 'delete'),
    HuaweiPoController.deleteHuaweiPoByID
);

export default router; 