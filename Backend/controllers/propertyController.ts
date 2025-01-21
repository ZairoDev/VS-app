import { Request, Response, RequestHandler } from "express";

import { Properties } from "../models/properties";

const getAllProperties: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { skip, limit } = await req.body;
    // const properties = await Properties.find({}).skip(skip).limit(limit);
    const properties = await Properties.aggregate([
      { $sample: { size: limit } },
      // { $skip: skip },
      // { $limit: limit },
    ]);

    res.json({ success: true, data: properties });
  } catch (err) {
    res.json({ error: "Unable to fetch Properties", status: 400 });
  }
};

const getParticularProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.body;

    const particularProperty = await Properties.findById(propertyId);

    res.send({ data: particularProperty, status: 200 });
  } catch (err) {
    res.json({ error: "Unable to fetch Particular Property", status: 400 });
  }
};

export { getAllProperties, getParticularProperty };
