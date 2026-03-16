const db = require("../config/db");
// Get all requests forwarded to manager
exports.getManagerRequests = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name as requester
       FROM requests r
       JOIN users u ON r.requester_id = u.id
       WHERE r.status = 'sent_to_manager'
       ORDER BY r.created_at DESC`
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve request
exports.approveRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `UPDATE requests
       SET status='approved'
       WHERE id=?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Request approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject request
exports.rejectRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `UPDATE requests
       SET status='rejected'
       WHERE id=?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// ----------------------------
// Get Audit Data (Approved + Rejected requests)
// ----------------------------
exports.getAuditData = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT r.id, r.title, r.status, r.created_at, r.vendor, r.description,
                    u.name AS requester,
                    IFNULL(SUM(ri.total),0) AS amount
             FROM requests r
             LEFT JOIN request_items ri ON r.id = ri.request_id
             JOIN users u ON r.requester_id = u.id
             WHERE r.status IN ('approved', 'rejected')
             GROUP BY r.id
             ORDER BY r.created_at DESC
             LIMIT 50`
        );

        res.status(200).json(rows);
    } catch (err) {
        console.error("Audit Data Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};