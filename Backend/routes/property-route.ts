import express from "express";

import {
  getAllProperties,
  getParticularProperty,
  getProperties,
  getMapMarkers,
} from "@/controllers/PropertyController";
const router = express.Router();

router.post("/getAllProperties", getAllProperties);
router.post("/getParticularProperty", getParticularProperty);
router.get("/getProperties", getProperties);
router.get("/map-markers", getMapMarkers);

export default router;
