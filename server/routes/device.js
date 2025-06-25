import express from "express";
import {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
  markDeviceUnderAttack,
  clearDeviceAttackStatus,
  getDevicesUnderAttack,
  getDeviceStatistics,
  setAttackerByIpPort,
  setMultipleAttackersByIpPort,
  clearAttackerByIpPort,
  findDeviceByIpPort,
  toggleAttackerByIpPort,
} from "../controllers/device.js";

const router = express.Router();

// ===== BASIC DEVICE CRUD ROUTES =====
// ✅ Tạo thiết bị mới
router.post("/create", createDevice);

// ✅ Lấy danh sách thiết bị
router.get("/getAll", getAllDevices);

// ✅ Lấy thống kê thiết bị
router.get("/statistics", getDeviceStatistics);

// ✅ Lấy danh sách thiết bị đang bị tấn công
router.get("/under-attack", getDevicesUnderAttack);

// ✅ Tìm thiết bị theo IP và Port
router.get("/find", findDeviceByIpPort);

// ✅ Lấy chi tiết thiết bị theo ID
router.get("/:id", getDeviceById);

// ✅ Cập nhật thiết bị theo ID
router.put("/:id", updateDevice);

// ✅ Xóa thiết bị theo ID
router.delete("/:id", deleteDevice);

// ===== ATTACK MANAGEMENT ROUTES (by Device ID) =====
// ✅ Đánh dấu thiết bị bị tấn công theo ID
router.put("/:id/mark-attack", markDeviceUnderAttack);

// ✅ Xóa trạng thái tấn công theo ID
router.put("/:id/clear-attack", clearDeviceAttackStatus);

// ===== ATTACK MANAGEMENT ROUTES (by IP:PORT) =====
// ✅ Đánh dấu thiết bị bị tấn công theo IP và Port
router.post("/set-attacker", setAttackerByIpPort);

// ✅ Đánh dấu nhiều thiết bị bị tấn công cùng lúc
router.post("/set-multiple-attackers", setMultipleAttackersByIpPort);

// ✅ Xóa trạng thái tấn công theo IP và Port
router.post("/clear-attacker", clearAttackerByIpPort);

// ✅ Toggle trạng thái tấn công theo IP và Port
router.post("/toggle-attacker", toggleAttackerByIpPort);

export default router;
