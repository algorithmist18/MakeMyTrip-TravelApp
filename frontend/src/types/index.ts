export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export type TravelStyle = "luxury" | "chill" | "romantic" | "family" | "cost-saving" | "backpacking";
export type HotelTier = "budget" | "mid" | "luxury";
export type TripStatus = "planning" | "completed" | "not-completed";

export interface Place {
  id: string;
  destination: string;
  name: string;
  neighborhood: string | null;
  category: string | null;
  rating: number;
  durationLabel: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
  isHiddenGem: boolean;
}

export interface Hotel {
  id: string;
  destination: string;
  name: string;
  neighborhood: string | null;
  rating: number;
  pricePerNight: number;
  tier: HotelTier;
  lat: number;
  lng: number;
  imageUrl: string | null;
}

export interface ItineraryItem {
  tripPlaceId: string;
  day: number;
  order: number;
  visited: boolean;
  addedBy: { id: string; name: string; avatarColor: string } | null;
  place: Place;
}

export interface ExtraActivity {
  id: string;
  title: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  destinationLat: number | null;
  destinationLng: number | null;
  startDate: string;
  endDate: string;
  travelStyle: TravelStyle;
  travelerCount: number;
  status: TripStatus;
  completedAt: string | null;
  askedCompletion: boolean;
  creator: User;
  collaborators: User[];
  dailySpendEstimate: number;
  itinerary: ItineraryItem[];
  extraActivities: ExtraActivity[];
}

export interface WrappedCircuitPoint {
  tripId: string;
  title: string;
  destination: string;
  lat: number;
  lng: number;
  startDate: string;
}

export interface WrappedResponse {
  year: number;
  stats: {
    tripsCompleted: number;
    citiesVisited: number;
    totalDays: number;
    topTravelStyle: string | null;
  };
  circuit: WrappedCircuitPoint[];
  trips: Array<{
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    travelStyle: TravelStyle;
  }>;
}
