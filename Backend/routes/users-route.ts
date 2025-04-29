import express from "express";

import { registerUser } from "../controllers/usersController";

const router = express.Router();

console.log('registerUser:', registerUser);
router.post("/register", registerUser);


export default router;