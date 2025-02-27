import express from "express";

import {
  getAllProperties,
  getParticularProperty,
  getProperties,
} from "@/controllers/PropertyController";
const router = express.Router();

router.post("/getAllProperties", getAllProperties);
router.post("/getParticularProperty", getParticularProperty);
router.get("/getProperties", getProperties);

export default router;
