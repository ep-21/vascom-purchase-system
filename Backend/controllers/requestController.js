const db = require("../config/db");

// 1️⃣ Create a new request
exports.createRequest = async (req, res) => {
    const { title, department, vendor, priority, request_date, description, items } = req.body;
    const requester_id = req.user.id; // Comes from verifyToken middleware

    if (!title || !department || !vendor || !priority || !request_date || !items || items.length === 0) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Insert request (no created_by column)
        const [result] = await db.query(
            `INSERT INTO requests
            (title, department, requester_id, vendor, priority, request_date, description)
            VALUES (?,?,?,?,?,?,?)`,
            [title, department, requester_id, vendor, priority, request_date, description]
        );

        const requestId = result.insertId;
        let totalAmount = 0;

        // Insert items
        for (let item of items) {
            const total = item.quantity * item.unit_price;
            totalAmount += total;

            await db.query(
                `INSERT INTO request_items
                (request_id, item_name, quantity, unit_price, total)
                VALUES (?,?,?,?,?)`,
                [requestId, item.item_name, item.quantity, item.unit_price, total]
            );
        }

        res.status(201).json({
            message: "Request created successfully",
            requestId,
            totalAmount
        });

    } catch (err) {
        console.error("Create Request Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// 2️⃣ Get all requests
exports.getRequests = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT r.*, u.name as requester
             FROM requests r
             JOIN users u ON r.requester_id = u.id
             ORDER BY r.created_at DESC`
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error("Get Requests Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// 3️⃣ Get single request by ID
exports.getRequestById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT r.*, u.name as requester
             FROM requests r
             JOIN users u ON r.requester_id = u.id
             WHERE r.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        const [items] = await db.query(
            `SELECT * FROM request_items WHERE request_id = ?`,
            [id]
        );

        res.status(200).json({ request: rows[0], items });

    } catch (err) {
        console.error("Get Request By ID Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// 4️⃣ Finance requests
exports.getFinanceRequests = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT r.*, u.name as requester
             FROM requests r
             JOIN users u ON r.requester_id = u.id
             WHERE r.status = 'pending'
             ORDER BY r.created_at DESC`
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error("Get Finance Requests Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};