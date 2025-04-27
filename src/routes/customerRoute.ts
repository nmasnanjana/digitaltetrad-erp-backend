import express from "express";
import CustomerController from "../controllers/customerController";

const router = express.Router();

// Create a new customer
router.post("/", CustomerController.createCustomer);

// Get all customers
router.get("/", CustomerController.getAllCustomers);

// Get customer by ID
router.get("/:id", CustomerController.getCustomerById);

// Update customer
router.put("/:id", CustomerController.updateCustomer);

// Delete customer
router.delete("/:id", CustomerController.deleteCustomer);

export default router; 