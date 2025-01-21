import express from "express";

import {
  getAllProperties,
  getParticularProperty,
} from "../controllers/propertyController";

const router = express.Router();

router.post("/getAllProperties", getAllProperties);
router.post("/getParticularProperty", getParticularProperty);

export default router;
