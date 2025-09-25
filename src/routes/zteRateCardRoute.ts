import express from "express";
import multer from "multer";
import ZteRateCardController from "../controllers/zteRateCardController";
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
    checkPermission('zteratecard', 'uploadexcelfile'),
    ZteRateCardController.uploadExcelFile
);

// Upload edited data directly
router.post("/upload-data", 
    checkPermission('zteratecard', 'uploadexcelfile'),
    ZteRateCardController.uploadData
);

// CRUD routes
router.get("/", 
    checkPermission('zteratecard', 'read'),
    ZteRateCardController.getAllRateCards
);

router.get("/:id", 
    checkPermission('zteratecard', 'read'),
    ZteRateCardController.getRateCardById
);

router.post("/", 
    checkPermission('zteratecard', 'create'),
    ZteRateCardController.createRateCard
);

router.put("/:id", 
    checkPermission('zteratecard', 'update'),
    ZteRateCardController.updateRateCard
);

router.delete("/:id", 
    checkPermission('zteratecard', 'delete'),
    ZteRateCardController.deleteRateCard
);

router.delete("/", 
    checkPermission('zteratecard', 'delete'),
    ZteRateCardController.deleteAllRateCards
);

export default router;
