import mongoose from "mongoose";

import {Properties} from "./Properties"; // ✅ if needed
import Traveller from "./traveller"; // ✅ if needed

const travellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true },
  nationality: { type: String, required: true },
  type: { type: String, enum: ["adult", "child", "infant"], required: true },
});

const bookingsSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "properties",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    travellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "travellers",
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
      adults: { type: Number, required: true },
      children: { type: Number, required: true },
      infants: { type: Number, required: true },
    },
    travellers: [travellerSchema],
    totalNights: { type: Number, required: true },
    price: { type: Number, required: true },
    paymentStatus: { 
      type: String,
      enum: ["paid", "pending", "refunded"],
      default: "pending",
    },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Bookings = mongoose.models.bookings || mongoose.model("bookings", bookingsSchema);