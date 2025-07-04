import  express  from "express";

import {
    createBooking,
    getBookingsByUser,
} from "@/controllers/bookingController";
const router = express.Router();

router.post("/create-booking", createBooking);
router.get("/:travellerId", getBookingsByUser);

export default router;

