export interface Center {
  lat: number;
  lng: number;
}

export interface PropertyInterface {
  _id: string;
  VSID: string;
  propertyName: string;
  placeName: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  size: number;
  guests: number;
  bedrooms: number;
  beds: number;
  bathroom: number;
  kitchen: number;
  basePrice: number;
  propertyImages: string[];
  propertyCoverFileUrl: string;
  propertyType: string;
  center: Center;
}
