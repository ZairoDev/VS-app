export interface PropertyInterface {
  _id: string;
  VSID: string;
  commonId: string;
  email: string;
  userId: string;
  portionNo: string;
  rentalType: string;
  isInstantBooking: boolean;
  propertyType: string;
  rentalForm: string;
  propertyName: string;
  placeName: string;
  newPlaceName: string;
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  center: object;
  size: number;
  guests: number;
  bedrooms: number;
  beds: number;
  bathroom: number;
  kitchen: number;
  childrenAge: number;
  basePrice: number;
  weekendPrice: number;
  weeklyDiscount: number;
  pricePerDay: number[][];
  basePriceLongTerm: number;
  monthlyDiscount: number;
  currency: string;
  icalLinks: object;
  generalAmenities: object;
  otherAmenities: object;
  safeAmenities: object;
  smoking: string;
  pet: string;
  party: string;
  cooking: string;
  additionalRules: string[];
  reviews: string;
  newReviews: string;
  /** Average guest rating when provided by API */
  rating?: number;
  /** Total review count when provided by API */
  reviewCount?: number;
  propertyImages: string[];
  propertyCoverFileUrl: string;
  propertyPictureUrls: string[];
  night: number[];
  time: number[];
  datesPerPortion: [];
  area?: string;
  subarea?: string;
  neighbourhood?: string;
  floor?: string;
  isTopFloor?: boolean;
  orientation?: string;
  levels?: number;
  zones?: string;
  propertyStyle?: string;
  constructionYear?: number;
  isSuitableForStudents?: boolean;
  monthlyExpenses?: number;
  heatingType?: string;
  heatingMedium?: string;
  energyClass?: string;
  nearbyLocations: nearbyLocationInterface;
  hostedFrom?: string;
  hostedBy?: string;
  listedOn?: string[];
  lastUpdatedBy?: string[];
  lastUpdates?: string[];
  isLive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface nearbyLocationInterface {
  nearbyLocationName: string[];
  nearbyLocationDistance: number[];
  nearbyLocationTag: string[];
  nearbyLocationUrl?: string[];
}

/** Lightweight property shape for the Trips map tab (VS-TRIP-012) */
export type MapMarkerProperty = {
  _id: string
  title?: string
  propertyName?: string
  basePrice?: number
  propertyCoverFileUrl?: string
  center?: {
    lat: number
    lng: number
  } | null
}

/** Server-side cluster bucket (VS-TRIP-063) */
export type ServerMapCluster = {
  lat: number
  lng: number
  count: number
  isCluster: true
}

export type MapMarkersApiResponse = {
  data: MapMarkerProperty[]
  clusters?: ServerMapCluster[]
  status?: number
}

export interface UserDataType {
  _id: string;
  name: string;
  preferredName: string;
  email: string;
  profilePic?: string;
  picture?: string;
  nationality?: string;
  gender?: "Male" | "Female" | "Other";
  spokenLanguage?: string;
  bankDetails: Record<string, any>;
  phone: string;
  emergencyContact: string;
  myRequests?: string[];
  wishlist: string[];
  myUpcommingRequests?: string[];
  declinedRequests?: Record<string, any>[];
  address?: string;
  password?: string;
  isVerified?: boolean;
  role?: "Owner" | "Traveller";
  Payment?: Record<string, any>;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Traveller {
  id: string;
  name: string;
  age: string;
  gender: string;
  nationality: string;
  type: 'Adult' | 'Child' | 'Infant';
}



interface Property {
  _id: string;
  propertyName: string;
  placeName: string;
  city: string;
  country: string;
  basePrice: number;
  propertyCoverFileUrl: string;
}
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Guests {
  adults: number;
  children: number;
  infants: number;
}

export interface Booking {
  _id: string;
  // These are populated on the backend. They can be null if the referenced
  // document was deleted or if population failed.
  propertyId: Property | null;
  userId: User | null; 
  travellerId: string; 
  startDate: string; 
  endDate: string;   
  travellers: Traveller[];
  guests: Guests;
  totalNights: number;
  price: number;
  paymentStatus: "pending" | "paid" | "refunded";
  bookingStatus: "pending" | "confirmed" | "cancelled";
  notes?: string; 
  createdAt: string;
  updatedAt: string; 
  __v: number; 
}
