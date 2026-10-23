
const express = require("express");
const router = express.Router();

const {
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
} = require("../controllers/testController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getTests);
router.get("/:id", getTestById);

router.post("/", protect, authorize("admin"), createTest);
router.put("/:id", protect, authorize("admin"), updateTest);
router.delete("/:id", protect, authorize("admin"), deleteTest);

module.exports = router;
