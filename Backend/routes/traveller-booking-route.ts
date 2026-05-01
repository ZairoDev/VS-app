import express from "express";

import {
  createTravellerBooking,
  getTravellerBookingsByUser,
  cancelTravellerBooking,
} from "@/controllers/travellerBookingController";

const router = express.Router();

router.post("/create-booking", createTravellerBooking);
router.get("/:travellerId", getTravellerBookingsByUser);
router.patch("/cancel/:id", cancelTravellerBooking);

export default router;
