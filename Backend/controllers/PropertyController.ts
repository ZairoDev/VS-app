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
  beds:number;
  bedrooms:number;
  bathroom:number;
  isEnabled: boolean;
  allowCooking: boolean;
  allowParty: boolean;
  allowPets: boolean; 
  minPrice: number;
  maxPrice: number;
}

const getAllProperties: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const {skip, limit, propertyType, selectedCountry,beds,bedrooms,bathroom,isEnabled,allowCooking,allowParty,allowPets,minPrice,maxPrice} =
      (await req.body) as FetchPropertiesRequest;

    console.log("request body: ", skip, limit, propertyType, selectedCountry,beds,bedrooms,bathroom,isEnabled,allowCooking,allowParty,allowPets);

    //! created query to filter properties based on propertyType and selectedCountry
    const query: FilterQuery<Document> = {};
    if (propertyType.length) {
      query["propertyType"] = { $in: propertyType };
    }
    if (selectedCountry.length) {
      query["country"] = { $in: selectedCountry };
    }
    if(beds !== undefined && beds !== null && beds>0){
      query["beds"] = { $gte: beds };
    }
    if(bathroom !== undefined && bathroom !== null && bathroom>0){
      query["bathroom"] = { $gte: bathroom } ;
    }
    if(bedrooms !== undefined && bedrooms !== null && bedrooms>0){
      query["bedrooms"] =  { $gte: bedrooms }  ;
    }

    if (minPrice !== undefined && minPrice !== null && minPrice>10) {
      query["basePrice"] = { $gte: minPrice };
    }
    if (maxPrice !== undefined && maxPrice !== null && maxPrice<5000) {
      query["basePrice"] = { $lte: maxPrice };
    }

    if(isEnabled){
      query['rentalType']="Long Term";
    }
    if(allowCooking){
      query['cooking']="Allow";
    }
    if(allowParty){
      query['party']="Allow";
    }
    if(allowPets){
      query['pet']="Allow";
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


const getProperties = async (req: Request, res: Response) => {
  try {
    const property = await Properties.find({},{center:1});
    
    if (!property) {
       res.status(404).json({ error: "No property found", status: 404 });
    }

    res.json({ data:property, status: 200 });
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch property", status: 500 });
  }
};

export { getAllProperties, getParticularProperty ,getProperties};