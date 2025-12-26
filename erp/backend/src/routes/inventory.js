// src/routes/inventory.js
import express from 'express';
import * as inventoryController from '../controllers/inventory/inventoryController.js';
import { authMiddleware, requireRoles, requireCompany } from '../middleware/auth.js';

const router = express.Router();

// All inventory routes require authentication and company membership
router.use(authMiddleware);
router.use(requireCompany);

// ============================================
// CATEGORIES
// ============================================
router.get("/categories", inventoryController.getCategories);
router.post("/categories", requireRoles("company_admin", "inventory_manager"), inventoryController.createCategory);
router.put("/categories/:id", requireRoles("company_admin", "inventory_manager"), inventoryController.updateCategory);
router.delete("/categories/:id", requireRoles("company_admin", "inventory_manager"), inventoryController.deleteCategory);

// ============================================
// PRODUCTS
// ============================================
router.get("/products", inventoryController.getProducts);
router.get("/products/:id", inventoryController.getProduct);
router.post("/products", requireRoles("company_admin", "inventory_manager"), inventoryController.createProduct);
router.put("/products/:id", requireRoles("company_admin", "inventory_manager"), inventoryController.updateProduct);
router.delete("/products/:id", requireRoles("company_admin", "inventory_manager"), inventoryController.deleteProduct);

// ============================================
// STOCK
// ============================================
router.get("/stock/movements", inventoryController.getStockMovements);
router.post("/stock/adjust", requireRoles("company_admin", "inventory_manager"), inventoryController.adjustStock);
router.get("/stock/alerts", inventoryController.getLowStockAlerts);

// ============================================
// PURCHASE ORDERS
// ============================================
router.get("/purchase-orders", inventoryController.getPurchaseOrders);
router.post("/purchase-orders", requireRoles("company_admin", "inventory_manager"), inventoryController.createPurchaseOrder);

export default router;
