import mongoose, { Schema } from "mongoose";

const bookingsSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    travellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

export const Bookings =
  mongoose.models.Bookings || mongoose.model("Bookings", bookingsSchema);