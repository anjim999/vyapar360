// src/controllers/inventoryController.js
import * as inventoryService from "../../services/inventoryService.js";

export async function getCategories(req, res) {
    try {
        const { companyId } = req.user;
        const result = await inventoryService.getAllCategories(companyId);
        res.json(result);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ success: false, error: "Failed to fetch categories" });
    }
}

export async function createCategory(req, res) {
    try {
        const { companyId } = req.user;
        const { name, description, parent_id } = req.body;
        const result = await inventoryService.createNewCategory(companyId, { name, description, parent_id });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating category:", err);
        res.status(500).json({ success: false, error: "Failed to create category" });
    }
}

export async function updateCategory(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const { name, description, parent_id } = req.body;
        const result = await inventoryService.updateExistingCategory(companyId, id, { name, description, parent_id });
        res.json(result);
    } catch (err) {
        console.error("Error updating category:", err);
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to update category" });
    }
}

export async function deleteCategory(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const result = await inventoryService.deleteExistingCategory(companyId, id);
        res.json(result);
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ success: false, error: "Failed to delete category" });
    }
}

export async function getProducts(req, res) {
    try {
        const { companyId } = req.user;
        const { category_id, search, low_stock, status } = req.query;
        const result = await inventoryService.getAllProducts(companyId, { category_id, search, low_stock, status });
        res.json(result);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ success: false, error: "Failed to fetch products" });
    }
}

export async function getProduct(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const result = await inventoryService.getProductById(companyId, id);
        res.json(result);
    } catch (err) {
        console.error("Error fetching product:", err);
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to fetch product" });
    }
}

export async function createProduct(req, res) {
    try {
        const { companyId, userId } = req.user;
        const { name, sku, description, category_id, unit, cost_price, selling_price, current_stock, min_stock_level, max_stock_level, location } = req.body;
        const result = await inventoryService.createNewProduct(companyId, userId, { name, sku, description, category_id, unit, cost_price, selling_price, current_stock, min_stock_level, max_stock_level, location });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating product:", err);
        res.status(500).json({ success: false, error: "Failed to create product" });
    }
}

export async function updateProduct(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const updateData = req.body;
        const result = await inventoryService.updateExistingProduct(companyId, id, updateData);
        res.json(result);
    } catch (err) {
        console.error("Error updating product:", err);
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to update product" });
    }
}

export async function deleteProduct(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const result = await inventoryService.deleteExistingProduct(companyId, id);
        res.json(result);
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ success: false, error: "Failed to delete product" });
    }
}

export async function adjustStock(req, res) {
    try {
        const { companyId, userId } = req.user;
        const { product_id, type, quantity, notes } = req.body;
        const result = await inventoryService.adjustProductStock(companyId, userId, { product_id, type, quantity, notes });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error adjusting stock:", err);
        res.status(500).json({ success: false, error: "Failed to adjust stock" });
    }
}

export async function getStockMovements(req, res) {
    try {
        const { companyId } = req.user;
        const { product_id, type, start_date, end_date } = req.query;
        const result = await inventoryService.getAllStockMovements(companyId, { product_id, type, start_date, end_date });
        res.json(result);
    } catch (err) {
        console.error("Error fetching stock movements:", err);
        res.status(500).json({ success: false, error: "Failed to fetch stock movements" });
    }
}

export async function getLowStockAlerts(req, res) {
    try {
        const { companyId } = req.user;
        const result = await inventoryService.getLowStockProducts(companyId);
        res.json(result);
    } catch (err) {
        console.error("Error fetching low stock alerts:", err);
        res.status(500).json({ success: false, error: "Failed to fetch low stock alerts" });
    }
}

export async function getPurchaseOrders(req, res) {
    try {
        const { companyId } = req.user;
        const { status, vendor_id } = req.query;
        const result = await inventoryService.getAllPurchaseOrders(companyId, { status, vendor_id });
        res.json(result);
    } catch (err) {
        console.error("Error fetching purchase orders:", err);
        res.status(500).json({ success: false, error: "Failed to fetch purchase orders" });
    }
}

export async function createPurchaseOrder(req, res) {
    try {
        const { companyId, userId } = req.user;
        const { vendor_id, order_date, expected_date, notes, items } = req.body;
        const result = await inventoryService.createNewPurchaseOrder(companyId, userId, { vendor_id, order_date, expected_date, notes, items });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating purchase order:", err);
        res.status(500).json({ success: false, error: "Failed to create purchase order" });
    }
}
