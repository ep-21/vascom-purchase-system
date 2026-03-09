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