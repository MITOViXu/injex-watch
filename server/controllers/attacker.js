import Attacker from "../models/Attacker.js";
import Device from "../models/Device.js";

// Tạo mới một attacker và lấy vị trí từ IP
export const createAttacker = async (req, res) => {
  try {
    const { ip, status, devices } = req.body;
    console.log("ip address: ", ip);
    // Lấy vị trí từ IP bằng fetch
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const locationData = await response.json();

    // Kiểm tra nếu vị trí trả về hợp lệ
    if (locationData.status !== "success") {
      return res.status(400).json({ message: "Không thể lấy vị trí từ IP" });
    }

    // Lấy lat và lon từ response
    const { lat, lon } = locationData;
    console.log("Location: Latitude:", lat, "Longitude:", lon);

    // Tạo mới attacker với vị trí đã lấy được
    const attacker = await Attacker.create({
      ip,
      location: {
        latitude: lat,
        longitude: lon,
      },
      latest_attack: Date.now(),
      status,
      devices,
    });

    // Duyệt qua mảng devices để tìm và cập nhật thông tin vào device
    for (const device of devices) {
      const foundDevice = await Device.findOne({
        ip: device.ip,
        port: device.port,
      });
      if (foundDevice) {
        // Thêm attacker vào mảng attackers của device
        foundDevice.attackers.push(attacker._id);
        await foundDevice.save();
      }
    }

    res.status(201).json(attacker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllAttackers = async (req, res) => {
  try {
    // Sắp xếp theo trường 'latest_attack' (giảm dần)
    const attackers = await Attacker.find().sort({ latest_attack: -1 }); // -1 là giảm dần

    res.status(200).json(attackers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết của một attacker theo ID
export const getAttackerById = async (req, res) => {
  try {
    const { id } = req.params;
    const attacker = await Attacker.findById(id);
    if (!attacker) {
      return res.status(404).json({ message: "Attacker not found" });
    }
    res.status(200).json(attacker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin một attacker
export const updateAttacker = async (req, res) => {
  try {
    const { id } = req.params;
    const attacker = await Attacker.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!attacker) {
      return res.status(404).json({ message: "Attacker not found" });
    }

    res.status(200).json(attacker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa một attacker
export const deleteAttacker = async (req, res) => {
  try {
    const { id } = req.params;

    const attacker = await Attacker.findByIdAndDelete(id);
    if (!attacker) {
      return res.status(404).json({ message: "Attacker not found" });
    }

    // Xóa attacker khỏi danh sách attackers của các device
    for (const device of attacker.devices) {
      await Device.updateOne(
        { ip: device.ip, port: device.port },
        { $pull: { attackers: attacker._id } }
      );
    }

    res.status(200).json({ message: "Attacker deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tìm attacker theo IP Address
export const getAttackerByIp = async (req, res) => {
  try {
    const { ip } = req.params;

    const attacker = await Attacker.findOne({ ip });
    if (!attacker) {
      return res
        .status(404)
        .json({ message: "Attacker not found with this IP" });
    }

    res.status(200).json(attacker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
