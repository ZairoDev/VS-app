import {Router} from "express";

import { getAllProperties } from "../Controllers/PropertyController.js";

const router =Router();

router.get("/",getAllProperties)

export default router;
