import { Router } from "express";

import {
  getAllProperties,
  getOneProperty,
  temp,
} from "../Controllers/PropertyController";

const router = Router();

router.get("/", getAllProperties);
router.get("/abc", temp);
router.post("/particularProperty/:id", getOneProperty);

export default router;
