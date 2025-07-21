import  express  from "express";

import {
    createBooking,
    getBookingsByUser,
    cancelBooking
} from "@/controllers/bookingController";
const router = express.Router();

router.post("/create-booking", createBooking);
router.get("/:travellerId", getBookingsByUser);
router.patch("/cancel/:id", cancelBooking)
export default router;

