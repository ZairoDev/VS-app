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
  rentalType: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathroom: number;
  kitchen: number;
  smoking: string;
  pet: string;
  party: string;
  cooking: string;
  basePrice: number;
  propertyImages: string[];
  propertyCoverFileUrl: string;
  propertyType: string;
  center: Center;
}
// export interface PropertyInterface {
//   _id?: string;
//   userId?: string;

//   VSID?: string;
//   isInstantBooking?: boolean;
//   rentalType?:string;
//   propertyType?: string;
//   placeName?: string;
//   rentalForm?: string;
//   numberOfPortions?: number;

//   street?: string;
//   postalCode?: string;
//   city?: string;
//   state?: string;
//   country?: string;
//   center?: object;

//   portionName?: string[];
//   portionSize?: number[];
//   guests?: number[];
//   bedrooms?: number[];
//   beds?: number[];
//   bathroom?: number[];
//   kitchen?: number[];
//   childrenAge?: number[];

//   basePrice?: number[];
//   weekendPrice?: number[];
//   monthlyDiscount?: number[];
//   currency?: string;

//   pricePerDay?: number[][][];
//   icalLinks?: object;

//   generalAmenities?: object;
//   otherAmenities?: object;
//   safeAmenities?: object;

//   smoking?: string;
//   pet?: string;
//   party?: string;
//   cooking?: string;
//   additionalRules?: string[];

//   reviews?: string[];
//   newReviews?: string;

//   propertyCoverFileUrl?: string;
//   propertyPictureUrls?: string[];
//   portionCoverFileUrls?: string[];
//   portionPictureUrls?: string[][];

//   night?: number[];
//   time?: number[];
//   datesPerPortion?: number[][];

//   isLive?: boolean;
// }