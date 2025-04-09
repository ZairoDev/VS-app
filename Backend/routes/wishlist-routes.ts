import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlistController";

const router = express.Router();

router.post("/add", addToWishlist);
router.post("/remove", removeFromWishlist);
router.post("/get", getWishlist);

export default router;
