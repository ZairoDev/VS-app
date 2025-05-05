import { createOrder, verifyPayment } from "@/controllers/paymentController";
import express from "express";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

export default router;