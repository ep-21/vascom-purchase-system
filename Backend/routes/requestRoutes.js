const express = require("express");
const router = express.Router();

const {
createRequest,
getRequests,
getRequestById,
getFinanceRequests
} = require("../controllers/requestController");

const {verifyToken,checkRole} = require("../middleware/authMiddleware");

router.post("/requests",
verifyToken,
checkRole("technical"),
createRequest);

router.get("/requests",
verifyToken,
getRequests);

router.get("/requests/:id",
verifyToken,
getRequestById);

router.get("/finance/requests",
  verifyToken,
  checkRole("finance"),
  getFinanceRequests
);

module.exports = router;