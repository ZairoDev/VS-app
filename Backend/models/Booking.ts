import mongoose from "mongoose";

const travellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true },
  nationality: { type: String, required: true },
  type: { type: String, enum: ["Adult", "Child", "Infant"], required: true },
});

const bookingsSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "properties",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    travellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "traveller",
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
      default: "confirmed",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Bookings =
  mongoose.models.Bookings || mongoose.model("Bookings", bookingsSchema);
