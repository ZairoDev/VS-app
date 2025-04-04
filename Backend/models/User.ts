import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    picture: {
      type: String, 
    },
    nationality: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    spokenLanguage: {
      type: String,
      default: "English",
    },
    bankDetails: {
      type: Object,
      default: "",
    },
    phone: {
      type: String,
    },
    myRequests: {
      type: [String],
      require: false,
    },
    myUpcommingRequests: {
      type: [String],
      require: false,
    },
    declinedRequests: {
      type: [Object],
      require: false,
      default: [],
    },
    address: {
      type: String,
      default: "",
    },
    password: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["Owner", "Traveller"],
      default: "Owner",
    },
    Payment: Object,
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
  },
  { timestamps: true }
);

const User = mongoose.models?.users || mongoose.model("users", userSchema);
export default User;
