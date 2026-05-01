import { Request, Response } from "express";
import mongoose from "mongoose";

import { TravellerBookings } from "../models/TravellerBooking";

// Helper: nights between two date strings (ceil'd)
function calculateNights(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Helper: check date overlap with any non-cancelled booking on the same property
async function isOverlapping(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<boolean> {
  const overlap = await TravellerBookings.findOne({
    propertyId,
    bookingStatus: { $ne: "cancelled" },
    $or: [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      },
    ],
  });
  return !!overlap;
}

// GET /traveller-booking/:travellerId — all bookings for a given traveller
export const getTravellerBookingsByUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { travellerId } = req.params;

    if (!travellerId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const bookings = await TravellerBookings.find({ travellerId })
      .populate({
        path: "propertyId",
        select:
          "propertyName placeName city country propertyCoverFileUrl basePrice",
      })
      .populate({
        path: "userId",
        select: "name email phone",
      });

    if (!bookings.length) {
      res.status(404).json({ message: "No bookings found for this user" });
      return;
    }

    res.status(200).json({
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error: any) {
    console.error("Error fetching traveller bookings:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// POST /traveller-booking/create-booking
export const createTravellerBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      propertyId,
      userId,
      travellerId,
      startDate,
      endDate,
      guests,
      travellers,
      price,
      notes,
    } = req.body;

    // --- Field presence ---
    if (
      !propertyId ||
      !userId ||
      !travellerId ||
      !startDate ||
      !endDate ||
      !guests ||
      typeof guests !== "object" ||
      travellers === undefined ||
      price === undefined
    ) {
      res.status(400).json({
        message: "Missing required fields",
        required: [
          "propertyId",
          "userId",
          "travellerId",
          "startDate",
          "endDate",
          "guests",
          "travellers",
          "price",
        ],
      });
      return;
    }

    // --- ObjectId validity ---
    if (
      !mongoose.Types.ObjectId.isValid(propertyId) ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(travellerId)
    ) {
      res.status(400).json({
        message: "Invalid id(s) in request",
        propertyId,
        userId,
        travellerId,
      });
      return;
    }

    // --- Date validity ---
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      res.status(400).json({ message: "Invalid startDate/endDate" });
      return;
    }
    if (end <= start) {
      res.status(400).json({ message: "endDate must be after startDate" });
      return;
    }

    // --- Guests shape ---
    if (
      typeof guests.adults !== "number" ||
      typeof guests.children !== "number" ||
      typeof guests.infants !== "number"
    ) {
      res.status(400).json({
        message: "Invalid guests object",
        expected: {
          adults: "number",
          children: "number",
          infants: "number",
        },
        received: guests,
      });
      return;
    }

    // --- Price validity ---
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
      res.status(400).json({ message: "Invalid price" });
      return;
    }

    // --- Overlap check ---
    const hasOverlap = await isOverlapping(propertyId, startDate, endDate);
    if (hasOverlap) {
      res.status(409).json({ message: "Dates are already booked" });
      return;
    }

    const totalNights = calculateNights(startDate, endDate);

    const newBooking = await TravellerBookings.create({
      propertyId,
      userId,
      travellerId,
      startDate,
      endDate,
      guests,
      travellers,
      totalNights,
      price,
      notes,
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Traveller booking create error:", error);
    const err: any = error;

    const responseBody: any = { message: "Internal server error" };
    if (err?.name) responseBody.name = err.name;
    if (err?.message) responseBody.error = err.message;
    if (err?.code) responseBody.code = err.code;
    if (err?.errors) responseBody.validation = err.errors;

    if (err?.name === "ValidationError" || err?.name === "CastError") {
      res.status(400).json(responseBody);
      return;
    }
    res.status(500).json(responseBody);
  }
};

// PATCH /traveller-booking/cancel/:id
export const cancelTravellerBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await TravellerBookings.findById(id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (booking.bookingStatus === "cancelled") {
      res.status(400).json({ message: "Booking is already cancelled." });
      return;
    }

    const today = new Date();
    const startDate = new Date(booking.startDate);
    const daysUntilBooking = Math.ceil(
      (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    let refundPercentage = 0;
    if (booking.paymentStatus === "paid") {
      if (daysUntilBooking > 7) refundPercentage = 100;
      else if (daysUntilBooking > 0) refundPercentage = 70;
      else refundPercentage = 50;
    }

    const refundAmount = Math.round((booking.price * refundPercentage) / 100);

    booking.bookingStatus = "cancelled";
    if (booking.paymentStatus === "paid") {
      booking.paymentStatus = "refunded";
    }

    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully.",
      refundAmount,
      refundPercentage,
    });
  } catch (error) {
    console.error("Error cancelling traveller booking:", error);
    res.status(500).json({ message: "Failed to cancel booking." });
  }
};
