import express from "express";
import CustomerController from "../controllers/customerController";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

// Create a new customer
router.post("/", checkPermission('customer', 'create'), CustomerController.createCustomer);

// Get all customers
router.get("/", checkPermission('customer', 'read'), CustomerController.getAllCustomers);

// Get customer by ID
router.get("/:id", checkPermission('customer', 'read'), CustomerController.getCustomerById);

// Update customer by ID
router.put("/:id", checkPermission('customer', 'update'), CustomerController.updateCustomer);

// Delete customer by ID
router.delete("/:id", checkPermission('customer', 'delete'), CustomerController.deleteCustomer);

export default router; 