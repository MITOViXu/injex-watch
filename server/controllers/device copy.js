import Device from "../models/Device.js";

// ✅ Tạo thiết bị mới
export const createDevice = async (req, res) => {
  try {
    const { name, ip, port, status, attackers } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !ip || port === undefined) {
      return res
        .status(400)
        .json({ message: "Name, IP, and Port are required" });
    }

    if (port < 0 || port > 65535) {
      return res
        .status(400)
        .json({ message: "Port must be between 0 and 65535" });
    }

    // Đảm bảo không có phần tử trùng lặp trong mảng attackers
    const uniqueAttackers = [...new Set(attackers || [])];

    // Tạo mới thiết bị
    const newDevice = new Device({
      name,
      ip,
      port,
      status: status || "active",
      last_active: new Date(),
      attackers: uniqueAttackers,
    });

    await newDevice.save();

    res.status(201).json(newDevice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Lấy danh sách thiết bị
export const getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Lấy thông tin chi tiết thiết bị
export const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Cập nhật thiết bị
export const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ip, port, status, attackers } = req.body;

    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    // Cập nhật thông tin
    if (name) device.name = name;
    if (ip) device.ip = ip;
    if (port !== undefined) {
      if (port < 0 || port > 65535) {
        return res
          .status(400)
          .json({ message: "Port must be between 0 and 65535" });
      }
      device.port = port;
    }
    if (status) device.status = status;
    if (attackers) {
      // Đảm bảo mảng attackers không bị trùng lặp
      device.attackers = [...new Set(attackers)];
    }
    device.last_active = new Date();

    await device.save();

    res.status(200).json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Xóa thiết bị
export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findByIdAndDelete(id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json({ message: "Device deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
