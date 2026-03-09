const express = require("express");
const router = express.Router();

const {forwardToManager} =
require("../controllers/financeController");

const {verifyToken,checkRole} =
require("../middleware/authMiddleware");

router.put("/finance/forward/:id",
verifyToken,
checkRole("finance"),
forwardToManager);

module.exports = router;