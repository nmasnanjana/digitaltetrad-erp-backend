import express from "express";
import multer from "multer";
import EricssonRateCardController from "../controllers/ericssonRateCardController";
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
    checkPermission('ericssonratecard', 'uploadexcelfile'),
    EricssonRateCardController.uploadExcelFile
);

// Upload edited data directly
router.post("/upload-data", 
    checkPermission('ericssonratecard', 'uploadexcelfile'),
    EricssonRateCardController.uploadData
);

// CRUD routes
router.get("/", 
    checkPermission('ericssonratecard', 'read'),
    EricssonRateCardController.getAllRateCards
);

router.get("/:id", 
    checkPermission('ericssonratecard', 'read'),
    EricssonRateCardController.getRateCardById
);

router.post("/", 
    checkPermission('ericssonratecard', 'create'),
    EricssonRateCardController.createRateCard
);

router.put("/:id", 
    checkPermission('ericssonratecard', 'update'),
    EricssonRateCardController.updateRateCard
);

router.delete("/:id", 
    checkPermission('ericssonratecard', 'delete'),
    EricssonRateCardController.deleteRateCard
);

router.delete("/", 
    checkPermission('ericssonratecard', 'delete'),
    EricssonRateCardController.deleteAllRateCards
);

export default router; 