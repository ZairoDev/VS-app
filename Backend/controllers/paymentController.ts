import { Request, Response } from "express";
import { Bookings } from "@/models/Booking";
import crypto from "crypto";
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

export const verifyPayment = async (req:Request, res:Response) => {
    const { orderId, paymentId, signature, bookingId } = req.body;
  
    if (!process.env.RAZORPAY_SECRET) {
        throw new Error("RAZORPAY_SECRET not set in environment variables");
      }
      
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");
  
    if (expectedSignature !== signature) {
     res.status(400).json({ message: "Payment verification failed" });
      return 
    }
  
    await Bookings.findByIdAndUpdate(bookingId, { paymentStatus: "paid" });
  
    res.status(200).json({ message: "Payment verified and booking updated" });
  };