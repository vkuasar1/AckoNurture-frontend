import { apiRequest } from "./queryClient";

export interface Hospital {
  id: string;
  hospitalId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string | null;
  website: string | null;
  placeUrl: string | null;
  networkHospitalId: string | null;
  latitude: number;
  longitude: number;
  distanceValue: number;
  distanceUnit: string;
  hasCashless: boolean;
  hasExcluded: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  rating?: number;
}

export interface HospitalSearchResponse {
  hospitals: Hospital[];
  size: number;
  count: number;
  page: number;
  message: string;
  status: string;
}

export interface HospitalSearchParams {
  latLng: string; // Format: "lat,lng"
  page?: number;
  size?: number;
}

/**
 * Search for hospitals near a location
 */
export async function searchHospitals(
  params: HospitalSearchParams,
): Promise<HospitalSearchResponse> {
  const { latLng, page = 1, size = 10 } = params;
  const encodedLatLng = encodeURIComponent(latLng);
  const url = `/api/v1/hospitals/search?latLng=${encodedLatLng}&page=${page}&size=${size}`;

  const response = await apiRequest("GET", url);
  return response.json();
}

/**
 * Get user's current location
 */
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  });
}

/**
 * Format lat/lng as string for API
 */
export function formatLatLng(latitude: number, longitude: number): string {
  return `${latitude},${longitude}`;
}

export interface BookingSlot {
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  available: boolean;
  status: "available" | "booked";
}

export interface AvailableSlotsResponse {
  bookedSlots: number;
  slots: BookingSlot[];
  hospitalId: string;
  endDate: string;
  totalSlots: number;
  availableSlots: number;
  message: string;
  startDate: string;
  status: string;
}

export interface AvailableSlotsParams {
  hospitalId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

/**
 * Get available booking slots for a hospital
 */
export async function getAvailableSlots(
  params: AvailableSlotsParams,
): Promise<AvailableSlotsResponse> {
  const { hospitalId, startDate, endDate } = params;
  const url = `/api/v1/bookings/slots/available?hospitalId=${encodeURIComponent(hospitalId)}&startDate=${startDate}&endDate=${endDate}`;

  const response = await apiRequest("GET", url);
  return response.json();
}

/**
 * Filter slots to working hours (8 AM - 8 PM)
 */
export function filterWorkingHoursSlots(slots: BookingSlot[]): BookingSlot[] {
  return slots.filter((slot) => {
    const hour = parseInt(slot.slotStartTime.split(":")[0], 10);
    return hour >= 8 && hour < 20; // 8 AM to 7:59 PM (8 PM slot starts at 20:00)
  });
}

/**
 * Format time slot for display (e.g., "10:00 AM")
 */
export function formatSlotTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

export interface UnifiedBookingRequest {
  userId: string;
  hospitalId: string;
  serviceName: string;
  profileId: string;
  slotDate: string; // ISO date-time string (e.g., "2025-12-09T14:00:00")
  slotStartTime: string; // HH:mm format (e.g., "14:00")
  slotEndTime: string; // HH:mm format (e.g., "15:00")
  slotType: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  reason: string;
  notes?: string;
  specialityId?: string;
  bookingAmount: number;
  currency: string;
  forcePayment: boolean;
}

export interface Booking {
  bookingId: string;
  userId: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  slotDate: string;
  slotStartTime: { hour: number; minute: number; second: number; nano: number };
  slotEndTime: { hour: number; minute: number; second: number; nano: number };
  slotType: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  reason: string;
  notes?: string;
  specialityId?: string;
  vaccineId?: string;
  vaccineName?: string;
  isVaccineBooking: boolean;
  coveredByPlan: boolean;
  bookingAmount: number;
  currency: string;
  paymentStatus: string;
  orderId?: string;
  status: string;
  confirmedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a unified booking
 */
export async function createBooking(
  request: UnifiedBookingRequest,
): Promise<Booking> {
  const response = await apiRequest("POST", "/api/v1/bookings", request);
  return response.json();
}

/**
 * Get all bookings for a user
 */
export async function getBookingsByUserId(userId: string): Promise<Booking[]> {
  const response = await apiRequest("GET", `/api/v1/bookings/user/${userId}`);
  return response.json();
}
