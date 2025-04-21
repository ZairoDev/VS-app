import mongoose from "mongoose";

const travellerSchema = new mongoose.Schema(
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
      default: "",
    },
    emergencyContact: {
      type: String,
    },
    myRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "properties",
      },
    ],
    myUpcommingRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "properties",
      },
    ],
    declinedRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "properties",
      },
    ],
    myBookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bookings",
      },
    ],
    address: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["Owner", "Traveller"],
      default: "Traveller",
    },
    wishlist: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "properties",
      default: [],
    },
    Payment: {
      type: Object,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordTokenExpiry: {
      type: Date,
    },
    verifyToken: {
      type: String,
    },
    verifyTokenExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Traveller = mongoose.models?.travellers || mongoose.model("travellers", travellerSchema);
export default Traveller;
