import { createOrder } from "@/controllers/paymentController";
import express from "express";

const router = express.Router();

router.post("/create-order", createOrder);

export default router;