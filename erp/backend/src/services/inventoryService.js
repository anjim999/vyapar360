// backend/src/services/inventoryService.js
import pool from "../db/pool.js";

export async function getAllCategories(companyId) {
    const result = await pool.query(
        `SELECT c.*, 
        (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
       FROM product_categories c
       WHERE c.company_id = $1
       ORDER BY c.name`,
        [companyId]
    );
    return { success: true, data: result.rows };
}

export async function createNewCategory(companyId, { name, description, parent_id }) {
    const result = await pool.query(
        `INSERT INTO product_categories (company_id, name, description, parent_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
        [companyId, name, description, parent_id]
    );
    return { success: true, data: result.rows[0] };
}

export async function updateExistingCategory(companyId, id, { name, description, parent_id }) {
    const result = await pool.query(
        `UPDATE product_categories SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        parent_id = $3
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
        [name, description, parent_id, id, companyId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Category not found");
        error.statusCode = 404;
        throw error;
    }

    return { success: true, data: result.rows[0] };
}

export async function deleteExistingCategory(companyId, id) {
    await pool.query(
        `DELETE FROM product_categories WHERE id = $1 AND company_id = $2`,
        [id, companyId]
    );
    return { success: true, message: "Category deleted successfully" };
}

export async function getAllProducts(companyId, { category_id, search, low_stock, status }) {
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      WHERE p.company_id = $1
    `;
    const params = [companyId];
    let paramCount = 1;

    if (category_id) {
        paramCount++;
        query += ` AND p.category_id = $${paramCount}`;
        params.push(category_id);
    }

    if (search) {
        paramCount++;
        query += ` AND (LOWER(p.name) LIKE LOWER($${paramCount}) OR p.sku LIKE $${paramCount})`;
        params.push(`%${search}%`);
    }

    if (low_stock === "true") {
        query += ` AND p.current_stock <= p.min_stock_level`;
    }

    if (status === "active") {
        query += ` AND p.is_active = true`;
    } else if (status === "inactive") {
        query += ` AND p.is_active = false`;
    }

    query += ` ORDER BY p.name`;

    const result = await pool.query(query, params);
    return { success: true, data: result.rows };
}

export async function getProductById(companyId, id) {
    const result = await pool.query(
        `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN product_categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.company_id = $2`,
        [id, companyId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    const movements = await pool.query(
        `SELECT sm.*, u.name as created_by_name
       FROM stock_movements sm
       LEFT JOIN users u ON sm.created_by = u.id
       WHERE sm.product_id = $1
       ORDER BY sm.created_at DESC
       LIMIT 20`,
        [id]
    );

    return {
        success: true,
        data: {
            ...result.rows[0],
            stock_movements: movements.rows
        }
    };
}

export async function createNewProduct(companyId, userId, { name, sku, description, category_id, unit, cost_price, selling_price, current_stock, min_stock_level, max_stock_level, location }) {
    const result = await pool.query(
        `INSERT INTO products 
        (company_id, name, sku, description, category_id, unit,
         cost_price, selling_price, current_stock, min_stock_level,
         max_stock_level, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
        [companyId, name, sku, description, category_id, unit || 'pcs',
            cost_price || 0, selling_price || 0, current_stock || 0,
            min_stock_level || 0, max_stock_level, location]
    );

    if (current_stock > 0) {
        await pool.query(
            `INSERT INTO stock_movements 
          (company_id, product_id, type, quantity, reference_type, notes, created_by)
         VALUES ($1, $2, 'in', $3, 'initial', 'Initial stock', $4)`,
            [companyId, result.rows[0].id, current_stock, userId]
        );
    }

    return { success: true, data: result.rows[0] };
}

export async function updateExistingProduct(companyId, id, updateData) {
    const result = await pool.query(
        `UPDATE products SET
        name = COALESCE($1, name),
        sku = COALESCE($2, sku),
        description = COALESCE($3, description),
        category_id = COALESCE($4, category_id),
        unit = COALESCE($5, unit),
        cost_price = COALESCE($6, cost_price),
        selling_price = COALESCE($7, selling_price),
        min_stock_level = COALESCE($8, min_stock_level),
        max_stock_level = COALESCE($9, max_stock_level),
        location = COALESCE($10, location),
        is_active = COALESCE($11, is_active),
        updated_at = NOW()
       WHERE id = $12 AND company_id = $13
       RETURNING *`,
        [
            updateData.name, updateData.sku, updateData.description,
            updateData.category_id, updateData.unit, updateData.cost_price,
            updateData.selling_price, updateData.min_stock_level,
            updateData.max_stock_level, updateData.location,
            updateData.is_active, id, companyId
        ]
    );

    if (result.rows.length === 0) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    return { success: true, data: result.rows[0] };
}

export async function deleteExistingProduct(companyId, id) {
    await pool.query(
        `DELETE FROM products WHERE id = $1 AND company_id = $2`,
        [id, companyId]
    );
    return { success: true, message: "Product deleted successfully" };
}

export async function adjustProductStock(companyId, userId, { product_id, type, quantity, notes }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const movement = await client.query(
            `INSERT INTO stock_movements 
            (company_id, product_id, type, quantity, reference_type, notes, created_by)
           VALUES ($1, $2, $3, $4, 'adjustment', $5, $6)
           RETURNING *`,
            [companyId, product_id, type, quantity, notes, userId]
        );

        const stockChange = type === 'in' ? quantity : -quantity;
        await client.query(
            `UPDATE products SET
            current_stock = current_stock + $1,
            updated_at = NOW()
           WHERE id = $2 AND company_id = $3`,
            [stockChange, product_id, companyId]
        );

        await client.query("COMMIT");
        return { success: true, data: movement.rows[0] };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

export async function getAllStockMovements(companyId, { product_id, type, start_date, end_date }) {
    let query = `
      SELECT sm.*, p.name as product_name, u.name as created_by_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.created_by = u.id
      WHERE sm.company_id = $1
    `;
    const params = [companyId];
    let paramCount = 1;

    if (product_id) {
        paramCount++;
        query += ` AND sm.product_id = $${paramCount}`;
        params.push(product_id);
    }

    if (type) {
        paramCount++;
        query += ` AND sm.type = $${paramCount}`;
        params.push(type);
    }

    if (start_date) {
        paramCount++;
        query += ` AND sm.created_at >= $${paramCount}`;
        params.push(start_date);
    }

    if (end_date) {
        paramCount++;
        query += ` AND sm.created_at <= $${paramCount}`;
        params.push(end_date);
    }

    query += ` ORDER BY sm.created_at DESC LIMIT 100`;

    const result = await pool.query(query, params);
    return { success: true, data: result.rows };
}

export async function getLowStockProducts(companyId) {
    const result = await pool.query(
        `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN product_categories c ON p.category_id = c.id
       WHERE p.company_id = $1 
         AND p.is_active = true
         AND p.current_stock <= p.min_stock_level
       ORDER BY (p.current_stock - p.min_stock_level)`,
        [companyId]
    );
    return { success: true, data: result.rows };
}

export async function getAllPurchaseOrders(companyId, { status, vendor_id }) {
    let query = `
      SELECT po.*, v.name as vendor_name, u.name as created_by_name
      FROM purchase_orders po
      LEFT JOIN vendors v ON po.vendor_id = v.id
      LEFT JOIN users u ON po.created_by = u.id
      WHERE po.company_id = $1
    `;
    const params = [companyId];
    let paramCount = 1;

    if (status) {
        paramCount++;
        query += ` AND po.status = $${paramCount}`;
        params.push(status);
    }

    if (vendor_id) {
        paramCount++;
        query += ` AND po.vendor_id = $${paramCount}`;
        params.push(vendor_id);
    }

    query += ` ORDER BY po.created_at DESC`;

    const result = await pool.query(query, params);
    return { success: true, data: result.rows };
}

export async function createNewPurchaseOrder(companyId, userId, { vendor_id, order_date, expected_date, notes, items }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const poCount = await client.query(
            `SELECT COUNT(*) FROM purchase_orders WHERE company_id = $1`,
            [companyId]
        );
        const poNumber = `PO-${String(parseInt(poCount.rows[0].count) + 1).padStart(5, '0')}`;

        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

        const poResult = await client.query(
            `INSERT INTO purchase_orders 
            (company_id, po_number, vendor_id, order_date, expected_date, total_amount, notes, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
            [companyId, poNumber, vendor_id, order_date, expected_date, totalAmount, notes, userId]
        );

        const po = poResult.rows[0];

        for (const item of items) {
            await client.query(
                `INSERT INTO purchase_order_items 
          (purchase_order_id, product_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
                [po.id, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
            );
        }

        await client.query("COMMIT");
        return { success: true, data: po };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}
