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
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
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

const Device = mongoose.model("Device", DeviceSchema);
export default Device;
