import { Properties } from "../models/properties";
import { Request, Response } from "express";
import { RequestHandler } from "express";

const getAllProperties: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const properties = await Properties.find({}).limit(1);
    res.json({ data: properties, status: 200 });
  } catch (err) {
    res.json({ error: "Unable to fetch Properties", status: 400 });
  }
};

export { getAllProperties };
