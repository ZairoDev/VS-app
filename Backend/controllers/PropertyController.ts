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
  city: string;
  state: string;
  country: string;
}

const getAllProperties: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const {skip, limit, propertyType, selectedCountry,beds,bedrooms,bathroom,isEnabled,allowCooking,allowParty,allowPets,minPrice,maxPrice, city, state, country} =
      (await req.body) as FetchPropertiesRequest;
      
    console.log("request body: ", skip, limit, propertyType, selectedCountry,beds,bedrooms,bathroom,isEnabled,allowCooking,allowParty,allowPets);
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
    if (city) {
  query["city"] = { $regex: new RegExp(city, "i") }; // case-insensitive
} else if (state) {
  query["state"] = { $regex: new RegExp(state, "i") };
} else if (country) {
  query["country"] = { $regex: new RegExp(country, "i") };
}
    console.log("query: ", query)
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

const getProperties: RequestHandler = async (req, res) => {
  try {
    const properties = await Properties.find(
      { isLive: { $ne: false } },
      {
        center: 1,
        title: 1,
        propertyName: 1,
        basePrice: 1,
        propertyCoverFileUrl: 1,
      }
    ).lean();

    res.json({ data: properties, status: 200 });
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch property", status: 500 });
  }
};

function parseBoundsQuery(req: Request): {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
} | null {
  const north = Number(req.query.north);
  const south = Number(req.query.south);
  const east = Number(req.query.east);
  const west = Number(req.query.west);
  const zoom = Number(req.query.zoom ?? 10);

  if (
    !Number.isFinite(north) ||
    !Number.isFinite(south) ||
    !Number.isFinite(east) ||
    !Number.isFinite(west) ||
    north <= south ||
    east <= west
  ) {
    return null;
  }

  return { north, south, east, west, zoom };
}

function withCenterFromDoc(doc: Record<string, unknown>) {
  const center = doc.center as { lat?: number; lng?: number } | undefined;
  const location = doc.location as { coordinates?: [number, number] } | undefined;

  if (center?.lat != null && center?.lng != null) {
    return { ...doc, center: { lat: center.lat, lng: center.lng } };
  }

  const coords = location?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    return {
      ...doc,
      center: { lat: coords[1], lng: coords[0] },
    };
  }

  return doc;
}

const getMapMarkers: RequestHandler = async (req, res) => {
  try {
    const bounds = parseBoundsQuery(req);
    if (!bounds) {
      res.status(400).json({
        error: "Invalid bounds. Required: north, south, east, west (numeric).",
        status: 400,
      });
      return;
    }

    const { north, south, east, west, zoom } = bounds;

    const viewportMatch = {
      isLive: { $ne: false },
      $or: [
        {
          location: {
            $geoWithin: {
              $box: [
                [west, south],
                [east, north],
              ],
            },
          },
        },
        {
          location: { $exists: false },
          "center.lat": { $gte: south, $lte: north },
          "center.lng": { $gte: west, $lte: east },
        },
      ],
    };

    // Server-side cluster buckets at low zoom (VS-TRIP-063)
    if (zoom < 8) {
      const cellSize = zoom < 4 ? 8 : zoom < 6 ? 4 : 2;
      const clusters = await Properties.aggregate([
        { $match: viewportMatch },
        {
          $project: {
            lng: {
              $ifNull: [
                { $arrayElemAt: ["$location.coordinates", 0] },
                "$center.lng",
              ],
            },
            lat: {
              $ifNull: [
                { $arrayElemAt: ["$location.coordinates", 1] },
                "$center.lat",
              ],
            },
          },
        },
        { $match: { lat: { $ne: null }, lng: { $ne: null } } },
        {
          $group: {
            _id: {
              latBucket: { $floor: { $divide: ["$lat", cellSize] } },
              lngBucket: { $floor: { $divide: ["$lng", cellSize] } },
            },
            lat: { $avg: "$lat" },
            lng: { $avg: "$lng" },
            count: { $sum: 1 },
          },
        },
        { $limit: 200 },
      ]);

      const clusterPayload = clusters
        .filter((c) => c.lat != null && c.lng != null)
        .map((c) => ({
          lat: c.lat,
          lng: c.lng,
          count: c.count,
          isCluster: true as const,
        }));

      res.json({
        data: [],
        clusters: clusterPayload,
        status: 200,
      });
      return;
    }

    const properties = await Properties.find(viewportMatch)
      .select("title propertyName basePrice propertyCoverFileUrl center location")
      .limit(200)
      .lean();

    const data = properties.map((p) => withCenterFromDoc(p as Record<string, unknown>));

    res.json({ data, clusters: [], status: 200 });
  } catch (err) {
    console.error("getMapMarkers error:", err);
    res.status(500).json({ error: "Unable to fetch map markers", status: 500 });
  }
};

export { getAllProperties, getParticularProperty, getProperties, getMapMarkers };