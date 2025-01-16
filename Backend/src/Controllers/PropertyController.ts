import { Request, Response } from "express";
import { parse } from "path";

import { Properties } from "../models/property.js";
import mongoose from "mongoose";

export const getAllProperties = async (req: Request, res: Response) => {
  console.log("inside getAllProperties");
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const properties = await Properties.find().skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error("Error fetching results", error);
    res.status(500).json({
      success: false,
      message: "failed to fetch properties",
      error: error.message,
    });
  }
};

export const getOneProperty = async (req: Request, res: Response) => {
  console.log("inside one property route");
  try {
    const id = req.params.id;
    console.log("id", id);

    const ParticularProperty = await Properties.findById(id);
    console.log("particularproperty", ParticularProperty);
    res.status(200).json({
      success: true,
      data: ParticularProperty,
    });
  } catch (error) {
    console.error("error fetching properties", error);
  }
};

export const temp = async (req: Request, res: Response) => {
  console.log("call in temp");
  res.json({ message: "successfullllll" });
};
