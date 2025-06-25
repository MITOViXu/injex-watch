import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ip: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^(([0-9]{1,3}\.){3}[0-9]{1,3})|(([a-f0-9:]+:+)+[a-f0-9]+)$/i.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid IP address!`,
      },
    },
    port: {
      type: Number,
      required: true,
      min: [0, "Port must be greater than or equal to 0"],
      max: [65535, "Port must be less than or equal to 65535"],
      validate: {
        validator: function (v) {
          return Number.isInteger(v);
        },
        message: (props) => `${props.value} is not a valid port number!`,
      },
    },
    last_active: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    attackers: {
      type: Boolean,
      default: false,
      description:
        "Indicates whether this device is under attack or has attackers",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const formatter = new Intl.DateTimeFormat("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Ho_Chi_Minh",
        });

        if (ret.createdAt)
          ret.createdAt = formatter.format(new Date(ret.createdAt));
        if (ret.updatedAt)
          ret.updatedAt = formatter.format(new Date(ret.updatedAt));
        if (ret.last_active)
          ret.last_active = formatter.format(new Date(ret.last_active));

        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        const formatter = new Intl.DateTimeFormat("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Ho_Chi_Minh",
        });

        if (ret.createdAt)
          ret.createdAt = formatter.format(new Date(ret.createdAt));
        if (ret.updatedAt)
          ret.updatedAt = formatter.format(new Date(ret.updatedAt));
        if (ret.last_active)
          ret.last_active = formatter.format(new Date(ret.last_active));

        return ret;
      },
    },
  }
);

// Pre-save middleware to automatically update last_active when attackers status changes
DeviceSchema.pre("save", function (next) {
  if (this.isModified("attackers")) {
    this.last_active = new Date();
  }
  next();
});

// Static method to mark device as under attack
DeviceSchema.statics.markUnderAttack = function (deviceId) {
  return this.findByIdAndUpdate(
    deviceId,
    {
      attackers: true,
      last_active: new Date(),
      status: "blocked", // Optionally change status when under attack
    },
    { new: true }
  );
};

// Static method to clear attack status
DeviceSchema.statics.clearAttackStatus = function (deviceId) {
  return this.findByIdAndUpdate(
    deviceId,
    {
      attackers: false,
      last_active: new Date(),
      status: "active", // Reset to active when attack cleared
    },
    { new: true }
  );
};

// Instance method to check if device is under attack
DeviceSchema.methods.isUnderAttack = function () {
  return this.attackers === true;
};

const Device = mongoose.model("Device", DeviceSchema);
export default Device;
