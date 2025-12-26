// backend/src/services/companyService.js
import pool from "../db/pool.js";

export async function getPublicCompaniesWithFilters({ industry, city, search, rating, sort = "created_at", order = "desc", page = 1, limit = 12 }) {
    let query = `
      SELECT 
        c.id, c.name, c.slug, c.industry, c.description, c.logo,
        c.city, c.state, c.rating, c.review_count, c.is_verified,
        c.employee_count, c.established_year
      FROM companies c
      WHERE c.is_active = true
    `;
    const params = [];
    let paramCount = 0;

    if (industry) {
        paramCount++;
        query += ` AND c.industry = $${paramCount}`;
        params.push(industry);
    }

    if (city) {
        paramCount++;
        query += ` AND LOWER(c.city) = LOWER($${paramCount})`;
        params.push(city);
    }

    if (search) {
        paramCount++;
        query += ` AND (
        LOWER(c.name) LIKE LOWER($${paramCount}) OR 
        LOWER(c.description) LIKE LOWER($${paramCount}) OR
        LOWER(c.industry) LIKE LOWER($${paramCount})
      )`;
        params.push(`%${search}%`);
    }

    if (rating) {
        paramCount++;
        query += ` AND c.rating >= $${paramCount}`;
        params.push(parseFloat(rating));
    }

    const validSorts = ["created_at", "rating", "review_count", "name"];
    const sortBy = validSorts.includes(sort) ? sort : "created_at";
    const sortOrder = order === "asc" ? "ASC" : "DESC";
    query += ` ORDER BY c.is_featured DESC, c.${sortBy} ${sortOrder}`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
        `SELECT COUNT(*) FROM companies WHERE is_active = true`
    );

    return {
        success: true,
        data: {
            companies: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
            },
        },
    };
}

export async function getCompanyProfileBySlug(slug) {
    const companyResult = await pool.query(
        `SELECT 
        id, name, slug, industry, description, logo, email, phone,
        website, address, city, state, country, established_year,
        employee_count, rating, review_count, is_verified
      FROM companies 
      WHERE slug = $1 AND is_active = true`,
        [slug]
    );

    if (companyResult.rows.length === 0) {
        const error = new Error("Company not found");
        error.statusCode = 404;
        throw error;
    }

    const company = companyResult.rows[0];

    const servicesResult = await pool.query(
        `SELECT id, name, description, price_range 
       FROM company_services 
       WHERE company_id = $1 AND is_active = true`,
        [company.id]
    );

    const reviewsResult = await pool.query(
        `SELECT 
        r.id, r.rating, r.title, r.review, r.created_at,
        u.name as reviewer_name
       FROM company_reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.company_id = $1 AND r.is_visible = true
       ORDER BY r.created_at DESC
       LIMIT 10`,
        [company.id]
    );

    return {
        success: true,
        data: {
            ...company,
            services: servicesResult.rows,
            reviews: reviewsResult.rows,
        },
    };
}

export async function getAllIndustries() {
    const result = await pool.query(
        `SELECT id, name, icon FROM industries ORDER BY name`
    );
    return { success: true, data: result.rows };
}

export async function getCitiesWithCompanies() {
    const result = await pool.query(
        `SELECT DISTINCT city, COUNT(*) as count 
       FROM companies 
       WHERE is_active = true AND city IS NOT NULL 
       GROUP BY city 
       ORDER BY count DESC`
    );
    return { success: true, data: result.rows };
}

export async function registerNewCompany(userId, { name, industry, description, email, phone, website, address, city, state, country, pincode, gstin }) {
    const client = await pool.connect();
    try {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        await client.query("BEGIN");

        const companyResult = await client.query(
            `INSERT INTO companies 
            (name, slug, industry, description, email, phone, website, 
             address, city, state, country, pincode, gstin)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`,
            [name, slug, industry, description, email, phone, website,
                address, city, state, country || "India", pincode, gstin]
        );

        const company = companyResult.rows[0];

        await client.query(
            `UPDATE users SET company_id = $1, role = 'company_admin' WHERE id = $2`,
            [company.id, userId]
        );

        await client.query(
            `INSERT INTO company_settings (company_id) VALUES ($1)`,
            [company.id]
        );

        await client.query(
            `INSERT INTO leave_types (company_id, name, days_per_year) VALUES
            ($1, 'Casual Leave', 12),
            ($1, 'Sick Leave', 6),
            ($1, 'Earned Leave', 15)`,
            [company.id]
        );

        await client.query("COMMIT");

        return {
            success: true,
            message: "Company registered successfully",
            data: company,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        if (err.code === "23505") {
            const error = new Error("Company name already exists");
            error.statusCode = 400;
            throw error;
        }
        throw err;
    } finally {
        client.release();
    }
}

export async function getCompanyByCompanyId(companyId) {
    if (!companyId) {
        const error = new Error("You are not part of any company");
        error.statusCode = 400;
        throw error;
    }

    const result = await pool.query(
        `SELECT * FROM companies WHERE id = $1`,
        [companyId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Company not found");
        error.statusCode = 404;
        throw error;
    }

    return { success: true, data: result.rows[0] };
}

export async function updateCompanyDetails(companyId, updateData) {
    const result = await pool.query(
        `UPDATE companies SET
        name = COALESCE($1, name),
        industry = COALESCE($2, industry),
        description = COALESCE($3, description),
        logo = COALESCE($4, logo),
        email = COALESCE($5, email),
        phone = COALESCE($6, phone),
        website = COALESCE($7, website),
        address = COALESCE($8, address),
        city = COALESCE($9, city),
        state = COALESCE($10, state),
        country = COALESCE($11, country),
        pincode = COALESCE($12, pincode),
        gstin = COALESCE($13, gstin),
        pan = COALESCE($14, pan),
        established_year = COALESCE($15, established_year),
        employee_count = COALESCE($16, employee_count),
        updated_at = NOW()
      WHERE id = $17
      RETURNING *`,
        [
            updateData.name, updateData.industry, updateData.description,
            updateData.logo, updateData.email, updateData.phone,
            updateData.website, updateData.address, updateData.city,
            updateData.state, updateData.country, updateData.pincode,
            updateData.gstin, updateData.pan, updateData.established_year,
            updateData.employee_count, companyId
        ]
    );

    return { success: true, data: result.rows[0] };
}
