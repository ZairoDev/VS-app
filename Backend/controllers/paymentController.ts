import { Request, Response } from "express";
import { Bookings } from "@/models/Booking";
import  razorpayInstance  from "@/config/razorpay";

export const createOrder = async (req: Request, res: Response) => {
    const { amount, bookingId } = req.body;

    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `reciept_order_${bookingId}`,
        payment_capture: 1,
    };

    try {
        const order = await razorpayInstance.orders.create(options);

        await Bookings.findByIdAndUpdate(bookingId, {
            "payment.razorpayOrderId": order.id
          });

        res.json(order);  
        
    } catch (error) {
        res.status(500).json({ error: "Unable to create order", status: 500 , message: error.message });
        
    }

};