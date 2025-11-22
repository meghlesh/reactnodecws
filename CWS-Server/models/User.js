const { verify } = require('jsonwebtoken');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String },

  employeeId: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  maritalStatus: {
    type: String,
    enum: ["Single", "Married", "Divorced", "Widowed"],
    default: "Single"
  }
  ,
  designation: { type: String, required: true },
  department: { type: String, required: true },
  salary: { type: Number, required: true },
  salaryType: { type: String,},
  role: { type: String, enum: ["employee", "manager", "admin", "hr", "ceo"], default: "employee" },
  password: { type: String },
  image: { type: String }, // profile image
  doj: { type: Date },
  probationMonths: { type: Number, default: 6 }, // NEW

  refreshToken: { type: String, default: null },
  createAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Address
  currentAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
  },
  permanentAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
  },

  // Documents
  panCardPdf: { type: String },    // store PAN card PDF file name/path
  aadharCardPdf: { type: String }, // store Aadhar card PDF file name/path
  appointmentLetter: { type: String }, // optional
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  ,
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifsc: String,
    branch: String,
    UAN: String,
    passbookPdf: String // optional PDF
  },

  // Leave balance tracking
  sickLeaveBalance: { type: Number, default: 0 },
  casualLeaveBalance: { type: Number, default: 0 },
  LwpLeave: { type: Number, default: 0 },
  lastLeaveUpdate: {
    type: Date,
    default: null
  },
  // Soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },

  // Reset password
  verifyToken: { type: String },
  isVerified: { type: Boolean, default: false },

}, { strict: false });

const User = mongoose.model("User", userSchema);
module.exports = User;
