import Device from "../models/Device.js";

// ✅ Tạo thiết bị mới
export const createDevice = async (req, res) => {
  try {
    let { name, ip, port, status, attackers } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !ip || port === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, IP, and Port are required",
      });
    }

    // Convert port to number if it's a string
    if (typeof port === "string") {
      port = parseInt(port, 10);
    }

    // Validate port range
    if (isNaN(port) || port < 0 || port > 65535) {
      return res.status(400).json({
        success: false,
        message: "Port must be a valid number between 0 and 65535",
      });
    }

    // Validate attackers field if provided
    if (attackers !== undefined && typeof attackers !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Attackers field must be a boolean value (true/false)",
      });
    }

    // Validate status if provided
    if (status && !["active", "inactive", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: active, inactive, blocked",
      });
    }

    // Tạo mới thiết bị với defaults
    const newDevice = new Device({
      name: name.trim(),
      ip: ip.trim(),
      port: port,
      status: status || "active",
      attackers: false, // Always default to false
      last_active: new Date(),
    });

    await newDevice.save();

    res.status(201).json({
      success: true,
      message: "Device created successfully",
      data: newDevice,
    });
  } catch (error) {
    // Handle duplicate IP+Port combination
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Device with this IP and Port combination already exists",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Lấy danh sách thiết bị
export const getAllDevices = async (req, res) => {
  try {
    const {
      status,
      attackers,
      page = 1,
      limit = 50, // Increase default limit
      sortBy = "last_active",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (attackers !== undefined) filter.attackers = attackers === "true";

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get devices with pagination
    const devices = await Device.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Device.countDocuments(filter);

    // Get attack statistics
    const attackStats = await Device.aggregate([
      {
        $group: {
          _id: null,
          totalDevices: { $sum: 1 },
          devicesUnderAttack: {
            $sum: { $cond: [{ $eq: ["$attackers", true] }, 1, 0] },
          },
          activeDevices: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          inactiveDevices: {
            $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
          },
          blockedDevices: {
            $sum: { $cond: [{ $eq: ["$status", "blocked"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: devices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDevices: total,
        hasNext: skip + devices.length < total,
        hasPrev: parseInt(page) > 1,
      },
      statistics: attackStats[0] || {
        totalDevices: 0,
        devicesUnderAttack: 0,
        activeDevices: 0,
        inactiveDevices: 0,
        blockedDevices: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Lấy thông tin chi tiết thiết bị
export const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device ID format",
      });
    }

    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    res.status(200).json({
      success: true,
      data: device,
      isUnderAttack: device.isUnderAttack(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Cập nhật thiết bị
export const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, ip, port, status, attackers } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device ID format",
      });
    }

    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // Cập nhật thông tin với validation
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Name must be a non-empty string",
        });
      }
      device.name = name.trim();
    }

    if (ip !== undefined) {
      if (typeof ip !== "string" || ip.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "IP must be a non-empty string",
        });
      }
      device.ip = ip.trim();
    }

    if (port !== undefined) {
      // Convert port to number if it's a string
      if (typeof port === "string") {
        port = parseInt(port, 10);
      }

      if (isNaN(port) || port < 0 || port > 65535) {
        return res.status(400).json({
          success: false,
          message: "Port must be a valid number between 0 and 65535",
        });
      }
      device.port = port;
    }

    if (status !== undefined) {
      if (!["active", "inactive", "blocked"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be one of: active, inactive, blocked",
        });
      }
      device.status = status;
    }

    // Validate and update attackers field
    if (attackers !== undefined) {
      if (typeof attackers !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Attackers field must be a boolean value (true/false)",
        });
      }
      device.attackers = attackers;
    }

    device.last_active = new Date();

    await device.save();

    res.status(200).json({
      success: true,
      message: "Device updated successfully",
      data: device,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Xóa thiết bị
export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device ID format",
      });
    }

    const device = await Device.findByIdAndDelete(id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Device deleted successfully",
      deletedDevice: {
        id: device._id,
        name: device.name,
        ip: device.ip,
        port: device.port,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Đánh dấu thiết bị bị tấn công
export const markDeviceUnderAttack = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device ID format",
      });
    }

    const device = await Device.markUnderAttack(id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Device marked as under attack",
      data: device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Xóa trạng thái tấn công
export const clearDeviceAttackStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device ID format",
      });
    }

    const device = await Device.clearAttackStatus(id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attack status cleared successfully",
      data: device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Lấy danh sách thiết bị đang bị tấn công
export const getDevicesUnderAttack = async (req, res) => {
  try {
    const devicesUnderAttack = await Device.find({ attackers: true }).sort({
      last_active: -1,
    });

    res.status(200).json({
      success: true,
      count: devicesUnderAttack.length,
      data: devicesUnderAttack,
      message:
        devicesUnderAttack.length > 0
          ? `Found ${devicesUnderAttack.length} device(s) under attack`
          : "No devices currently under attack",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Lấy thống kê thiết bị
export const getDeviceStatistics = async (req, res) => {
  try {
    const stats = await Device.aggregate([
      {
        $group: {
          _id: null,
          totalDevices: { $sum: 1 },
          devicesUnderAttack: {
            $sum: { $cond: [{ $eq: ["$attackers", true] }, 1, 0] },
          },
          activeDevices: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          inactiveDevices: {
            $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
          },
          blockedDevices: {
            $sum: { $cond: [{ $eq: ["$status", "blocked"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get recent attack activity
    const recentAttacks = await Device.find({ attackers: true })
      .sort({ last_active: -1 })
      .limit(5)
      .select("name ip port last_active status");

    // Calculate attack percentage
    const statistics = stats[0] || {
      totalDevices: 0,
      devicesUnderAttack: 0,
      activeDevices: 0,
      inactiveDevices: 0,
      blockedDevices: 0,
    };

    // Add calculated fields
    const enhancedStats = {
      ...statistics,
      attackPercentage:
        statistics.totalDevices > 0
          ? (
              (statistics.devicesUnderAttack / statistics.totalDevices) *
              100
            ).toFixed(2)
          : 0,
      safeDevices: statistics.totalDevices - statistics.devicesUnderAttack,
    };

    res.status(200).json({
      success: true,
      statistics: enhancedStats,
      recentAttacks: recentAttacks,
      summary: {
        totalDevices: enhancedStats.totalDevices,
        underAttack: enhancedStats.devicesUnderAttack,
        safe: enhancedStats.safeDevices,
        attackRate: `${enhancedStats.attackPercentage}%`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Set attackers = true dựa trên IP và Port
export const setAttackerByIpPort = async (req, res) => {
  try {
    const { ip, port } = req.body;

    // Validate input
    if (!ip || port === undefined) {
      return res.status(400).json({
        success: false,
        message: "IP and Port are required",
      });
    }

    // Convert port to number if it's a string
    let portNumber = port;
    if (typeof port === "string") {
      portNumber = parseInt(port, 10);
    }

    // Validate port
    if (isNaN(portNumber) || portNumber < 0 || portNumber > 65535) {
      return res.status(400).json({
        success: false,
        message: "Port must be a valid number between 0 and 65535",
      });
    }

    // Find device by IP and Port
    const device = await Device.findOne({
      ip: ip.trim(),
      port: portNumber,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: `Device not found with IP: ${ip} and Port: ${portNumber}`,
      });
    }

    // Set attackers to true and update status
    device.attackers = true;
    // device.status = "blocked"; // Optionally change status
    device.last_active = new Date();

    await device.save();

    res.status(200).json({
      success: true,
      message: `Device ${device.name} (${ip}:${portNumber}) marked as under attack`,
      data: device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Set attackers = true cho multiple devices dựa trên array IP:Port
export const setMultipleAttackersByIpPort = async (req, res) => {
  try {
    const { targets } = req.body;

    // Validate input
    if (!Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Targets must be a non-empty array of {ip, port} objects",
      });
    }

    const results = [];
    const errors = [];

    // Process each target
    for (const target of targets) {
      try {
        const { ip, port } = target;

        if (!ip || port === undefined) {
          errors.push({
            target,
            error: "IP and Port are required",
          });
          continue;
        }

        // Convert port to number if it's a string
        let portNumber = port;
        if (typeof port === "string") {
          portNumber = parseInt(port, 10);
        }

        // Validate port
        if (isNaN(portNumber) || portNumber < 0 || portNumber > 65535) {
          errors.push({
            target,
            error: "Invalid port number",
          });
          continue;
        }

        // Find and update device
        const device = await Device.findOne({
          ip: ip.trim(),
          port: portNumber,
        });

        if (!device) {
          errors.push({
            target,
            error: `Device not found`,
          });
          continue;
        }

        // Update device
        device.attackers = true;
        device.status = "blocked";
        device.last_active = new Date();
        await device.save();

        results.push({
          device: {
            id: device._id,
            name: device.name,
            ip: device.ip,
            port: device.port,
          },
          message: "Successfully marked as under attack",
        });
      } catch (err) {
        errors.push({
          target,
          error: err.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${targets.length} targets. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors,
      summary: {
        total: targets.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Clear attackers = false dựa trên IP và Port
export const clearAttackerByIpPort = async (req, res) => {
  try {
    const { ip, port } = req.body;

    // Validate input
    if (!ip || port === undefined) {
      return res.status(400).json({
        success: false,
        message: "IP and Port are required",
      });
    }

    // Convert port to number if it's a string
    let portNumber = port;
    if (typeof port === "string") {
      portNumber = parseInt(port, 10);
    }

    // Find device by IP and Port
    const device = await Device.findOne({
      ip: ip.trim(),
      port: portNumber,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: `Device not found with IP: ${ip} and Port: ${portNumber}`,
      });
    }

    // Clear attackers and reset status
    device.attackers = false;
    device.status = "active"; // Reset to active
    device.last_active = new Date();

    await device.save();

    res.status(200).json({
      success: true,
      message: `Attack status cleared for device ${device.name} (${ip}:${portNumber})`,
      data: device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Tìm device dựa trên IP và Port (helper function)
export const findDeviceByIpPort = async (req, res) => {
  try {
    const { ip, port } = req.query;

    // Validate input
    if (!ip || port === undefined) {
      return res.status(400).json({
        success: false,
        message: "IP and Port are required as query parameters",
      });
    }

    // Convert port to number if it's a string
    let portNumber = port;
    if (typeof port === "string") {
      portNumber = parseInt(port, 10);
    }

    // Find device by IP and Port
    const device = await Device.findOne({
      ip: ip.trim(),
      port: portNumber,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: `Device not found with IP: ${ip} and Port: ${portNumber}`,
      });
    }

    res.status(200).json({
      success: true,
      data: device,
      isUnderAttack: device.isUnderAttack(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Toggle attackers status dựa trên IP và Port
export const toggleAttackerByIpPort = async (req, res) => {
  try {
    const { ip, port } = req.body;

    // Validate input
    if (!ip || port === undefined) {
      return res.status(400).json({
        success: false,
        message: "IP and Port are required",
      });
    }

    // Convert port to number if it's a string
    let portNumber = port;
    if (typeof port === "string") {
      portNumber = parseInt(port, 10);
    }

    // Find device by IP and Port
    const device = await Device.findOne({
      ip: ip.trim(),
      port: portNumber,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: `Device not found with IP: ${ip} and Port: ${portNumber}`,
      });
    }

    // Toggle attackers status
    const wasUnderAttack = device.attackers;
    device.attackers = !device.attackers;
    device.status = device.attackers ? "blocked" : "active";
    device.last_active = new Date();

    await device.save();

    res.status(200).json({
      success: true,
      message: `Device ${device.name} (${ip}:${portNumber}) ${
        device.attackers ? "marked as under attack" : "attack status cleared"
      }`,
      data: device,
      previousStatus: wasUnderAttack,
      currentStatus: device.attackers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
