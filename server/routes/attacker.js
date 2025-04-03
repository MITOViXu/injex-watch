import express from "express";
import {
  createAttacker,
  getAllAttackers,
  getAttackerById,
  updateAttacker,
  deleteAttacker,
  getAttackerByIp,
} from "../controllers/attacker.js";

const router = express.Router();

// ✅ Tạo attacker mới
router.post("/create", createAttacker);

// ✅ Lấy tất cả attackers
router.get("/getAll", getAllAttackers);

// ✅ Lấy thông tin chi tiết attacker
router.get("/:id", getAttackerById);

// ✅ Cập nhật attacker
router.put("/:id", updateAttacker);

// ✅ Xóa attacker
router.delete("/:id", deleteAttacker);

// ✅ Tìm attacker theo IP
router.get("/ip/:ip", getAttackerByIp);

export default router;
