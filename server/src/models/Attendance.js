const mongoose = require("mongoose");

// Refactored to standard GeoJSON format for geospatial indexing
const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude] - Note the order is strictly Longitude then Latitude in GeoJSON
      required: true,
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    // ==========================================
    // EMPLOYEE
    // ==========================================
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      // Removed index: true because the compound index below covers it
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // DATE
    // ==========================================
    date: {
      type: Date, // Must be strictly normalized to UTC midnight in your controller
      required: true,
      index: true,
    },

    // ==========================================
    // CHECK IN
    // ==========================================
    checkIn: {
      type: Date,
      default: null,
    },
    checkInSelfie: {
      type: String,
      trim: true,
      default: null,
    },
    checkInLocation: {
      type: pointSchema,
      default: null,
    },

    // ==========================================
    // CHECK OUT
    // ==========================================
    checkOut: {
      type: Date,
      default: null,
    },
    checkOutSelfie: {
      type: String,
      trim: true,
      default: null,
    },
    checkOutLocation: {
      type: pointSchema,
      default: null,
    },

    // ==========================================
    // ATTENDANCE STATUS
    // ==========================================
    status: {
      type: String,
      enum: ["present", "late", "absent", "half-day"],
      default: "present",
      index: true,
    },

    // ==========================================
    // VERIFICATION
    // ==========================================
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // ==========================================
    // WORKING HOURS
    // ==========================================
    workingMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    overtimeMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // NOTES
    // ==========================================
    notes: {
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

// Unique attendance per employee per day
attendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

// Enable geospatial queries for locations if needed later
attendanceSchema.index({ checkInLocation: "2dsphere" });
attendanceSchema.index({ checkOutLocation: "2dsphere" });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;