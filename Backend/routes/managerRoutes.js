const express = require("express");
const router = express.Router();

const { approveRequest, rejectRequest, getManagerRequests,getAuditData } = require("../controllers/managerController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// Manager endpoints
router.get("/requests", verifyToken, checkRole("manager"), getManagerRequests);
router.put("/approve/:id", verifyToken, checkRole("manager"), approveRequest);
router.put("/reject/:id", verifyToken, checkRole("manager"), rejectRequest);
// Audit page data
router.get("/audit", verifyToken, checkRole("manager"), getAuditData);

module.exports = router;