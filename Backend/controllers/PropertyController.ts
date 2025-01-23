import { Document } from "mongodb";
import { FilterQuery } from "mongoose";
import { Request, Response, RequestHandler } from "express";

import { PropertyInterface } from "@/types";
import { Properties } from "@/models/Properties";

export interface FetchPropertiesRequest {
  skip: number;
  limit: number;
  selectedCountry: string[];
  propertyType: string[];
}

const getAllProperties: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { skip, limit, propertyType, selectedCountry } =
      (await req.body) as FetchPropertiesRequest;

    console.log("request body: ", skip, limit, propertyType, selectedCountry);

    //! created query to filter properties based on propertyType and selectedCountry
    const query: FilterQuery<Document> = {};
    if (propertyType.length) {
      query["propertyType"] = { $in: propertyType };
    }
    if (selectedCountry.length) {
      query["country"] = { $in: selectedCountry };
    }

    console.log("query: ", query);

    //! created pipeline to fetch properties if query is empty then fetch random properties else fetch properties based on query in a sequential order
    const pipeline = [];
    if (Object.keys(query).length > 0) {
      pipeline.push({ $match: query }, { $skip: skip });
    } else {
      pipeline.push({ $sample: { size: limit } });
    }
    pipeline.push({ $limit: limit });

    const properties: PropertyInterface[] = await Properties.aggregate(
      pipeline
    );

    console.log("properties: ", properties.length);

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
