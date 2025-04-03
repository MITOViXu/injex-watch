import mongoose from "mongoose";

const AttackerSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^(([0-9]{1,3}\.){3}[0-9]{1,3})|(([a-f0-9:]+:+)+[a-f0-9]+)$/i.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid IP address!`,
      },
    },
    location: {
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
    },
    latest_attack: {
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
        if (ret.latest_attack)
          ret.latest_attack = formatter.format(new Date(ret.latest_attack));

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
        if (ret.latest_attack)
          ret.latest_attack = formatter.format(new Date(ret.latest_attack));

        return ret;
      },
    },
  }
);

const Attacker = mongoose.model("Attacker", AttackerSchema);

export default Attacker;
