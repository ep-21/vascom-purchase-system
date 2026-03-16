exports.getTechnicalDashboard = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1️⃣ Stats
        const [statsRows] = await db.query(
            `SELECT 
                COUNT(*) AS total,
                SUM(status = 'pending') AS pending,
                SUM(status = 'approved') AS approved,
                SUM(status = 'rejected') AS rejected
             FROM requests
             WHERE requester_id = ?`,
            [userId]
        );

        // 2️⃣ Recent Requests with total amount
        const [recentRows] = await db.query(
            `SELECT r.id, r.title, r.status, r.created_at, u.name as requester,
                    IFNULL(SUM(ri.total),0) AS amount
             FROM requests r
             LEFT JOIN request_items ri ON r.id = ri.request_id
             JOIN users u ON r.requester_id = u.id
             WHERE r.requester_id = ?
             GROUP BY r.id
             ORDER BY r.created_at DESC
             LIMIT 5`,
            [userId]
        );

        res.status(200).json({
            stats: statsRows[0],
            recentRequests: recentRows
        });

    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};exports.getTechnicalDashboard = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1️⃣ Stats
        const [statsRows] = await db.query(
            `SELECT 
                COUNT(*) AS total,
                SUM(status = 'pending') AS pending,
                SUM(status = 'approved') AS approved,
                SUM(status = 'rejected') AS rejected
             FROM requests
             WHERE requester_id = ?`,
            [userId]
        );

        // 2️⃣ Recent Requests with total amount
        const [recentRows] = await db.query(
            `SELECT r.id, r.title, r.status, r.created_at, u.name as requester,
                    IFNULL(SUM(ri.total),0) AS amount
             FROM requests r
             LEFT JOIN request_items ri ON r.id = ri.request_id
             JOIN users u ON r.requester_id = u.id
             WHERE r.requester_id = ?
             GROUP BY r.id
             ORDER BY r.created_at DESC
             LIMIT 5`,
            [userId]
        );

        res.status(200).json({
            stats: statsRows[0],
            recentRequests: recentRows
        });

    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};