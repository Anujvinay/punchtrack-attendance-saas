const mongoose = require("mongoose");

const overtimeSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    attendance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
      // 🔧 index: true yahan se remove kar diya gaya hai conflict bachane ke liye
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    minutes: {
      type: Number,
      required: true,
      min: 1,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// 🔐 1 Attendance = 1 Overtime request maximum
overtimeSchema.index(
  { attendance: 1 },
  { unique: true }
);

const Overtime = mongoose.model(
  "Overtime",
  overtimeSchema
);

module.exports = Overtime;