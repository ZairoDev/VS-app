import express from "express";

import { getAllProperties } from "../controllers/propertyController";

const router = express.Router();

router.get("/getAllProperties", getAllProperties);

export default router;
