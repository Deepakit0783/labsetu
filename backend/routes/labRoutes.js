
const express = require("express");
const router = express.Router();

const {
  getLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab,
} = require("../controllers/labController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getLabs);
router.get("/:id", getLabById);

router.post("/", protect, authorize("admin"), createLab);
router.put("/:id", protect, authorize("admin"), updateLab);
router.delete("/:id", protect, authorize("admin"), deleteLab);

module.exports = router;
