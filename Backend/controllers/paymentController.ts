
// import { Bookings } from "@/models/Booking";
// import crypto from "crypto";
// import  razorpayInstance  from "@/config/razorpay";

// export const createOrder = async (req: Request, res: Response) => {
//     const { amount, bookingId } = req.body;

//     const options = {
//         amount: amount * 100,
//         currency: "INR",
//         receipt: `reciept_order_${bookingId}`,
//         payment_capture: 1,
//     };

//     try {
//         const order = await razorpayInstance.orders.create(options);

//         await Bookings.findByIdAndUpdate(bookingId, {
//             "payment.razorpayOrderId": order.id
//           });

//         res.json(order);  
        
//     } catch (error) {
//         res.status(500).json({ error: "Unable to create order", status: 500 , message: error.message });   
//     }
// };

// export const verifyPayment = async (req:Request, res:Response) => {
//     const { orderId, paymentId, signature, bookingId } = req.body;
  
//     if (!process.env.RAZORPAY_SECRET) {
//         throw new Error("RAZORPAY_SECRET not set in environment variables");
//       }
      
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(orderId + "|" + paymentId)
//       .digest("hex");
  
//     if (expectedSignature !== signature) {
//      res.status(400).json({ message: "Payment verification failed" });
//       return 
//     }
  
//     await Bookings.findByIdAndUpdate(bookingId, { paymentStatus: "paid" });
  
//     res.status(200).json({ message: "Payment verified and booking updated" });
//   };

import { Request, Response } from "express";
import { Bookings } from "../models/Booking";
import Razorpay from 'razorpay';
import crypto from 'crypto';


const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});


export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, bookingId } = req.body;
    console.log(bookingId);
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_order_${Math.floor(Math.random() * 1000000)}`
    };

    const order = await instance.orders.create(options);

    // Save razorpayOrderId to booking
    await Bookings.findByIdAndUpdate(bookingId, {
      $set: { "payment.razorpayOrderId": order.id }
    });

    res.json({ order });
  } catch (error) {
    console.error("Order creation failed", error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};



export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Generate signature to verify
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // ✅ Signature valid — Update booking status
      const booking = await Bookings.findOne({ "payment.razorpayOrderId": razorpay_order_id });

      if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found for this order ID" });
      }

      booking.payment.razorpayPaymentId = razorpay_payment_id;
      booking.payment.status = "paid";
      booking.payment.paidAt = new Date();
      booking.paymentStatus = "paid";
      booking.bookingStatus = "confirmed";

      await booking.save();

      res.json({ success: true, message: 'Payment verified and booking updated successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error("Payment verification failed", error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};
