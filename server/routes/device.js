import express from "express";
import {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
} from "../controllers/device.js";

const router = express.Router();

// ✅ Tạo thiết bị mới
router.post("/create", createDevice);

// ✅ Lấy danh sách thiết bị
router.get("/getAll", getAllDevices);

// ✅ Lấy chi tiết thiết bị theo ID
router.get("/:id", getDeviceById);

// ✅ Cập nhật thiết bị theo ID
router.put("/:id", updateDevice);

// ✅ Xóa thiết bị theo ID
router.delete("/:id", deleteDevice);

export default router;
