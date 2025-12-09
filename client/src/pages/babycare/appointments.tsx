import { Link, useParams } from "wouter";
import { ArrowLeft, Calendar, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getProfiles, type Profile } from "@/lib/profileApi";
import { getUserId } from "@/lib/userId";
import { getBookingsByUserId, type Booking } from "@/lib/hospitalApi";
import { MiraFab } from "@/components/MiraFab";

export default function Appointments() {
  const params = useParams();
  const babyId = params.babyId;

  // Fetch profiles from API
  const userId = getUserId();
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: [`/api/v1/profiles/user/${userId}`],
    queryFn: () => getProfiles(),
  });

  // Find baby profile - route param babyId is actually profileId
  const baby = profiles.find((p) => p.profileId === babyId);
  const babyProfileId = baby?.profileId || babyId;

  // Fetch bookings for the user
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: [`/api/v1/bookings/user/${userId}`],
    enabled: !!userId,
    queryFn: () => getBookingsByUserId(userId),
  });

  // Sort bookings by createdAt descending
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Descending order
  });

  if (!baby) {
    return (
      <div className="app-container min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500">Baby not found</p>
      </div>
    );
  }

  return (
    <div className="app-container bg-gradient-to-b from-violet-50 to-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href={`/babycare/home/${babyProfileId}`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-[18px] font-bold">Appointments</h1>
              <p className="text-[13px] text-white/70">
                View and manage your bookings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8 px-4 pt-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
          </div>
        ) : sortedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-[16px] font-semibold text-zinc-800 mb-2">
              No appointments yet
            </h3>
            <p className="text-[13px] text-zinc-500 text-center max-w-[280px]">
              Book your first appointment from the vaccines page to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBookings.map((booking) => {
              const slotDate = new Date(booking.slotDate);
              const isPast = slotDate < new Date();
              const slotTime = booking.slotStartTime
                ? `${String(booking.slotStartTime.hour).padStart(2, "0")}:${String(booking.slotStartTime.minute).padStart(2, "0")}`
                : "";

              return (
                <Card
                  key={booking.bookingId}
                  className={`border ${
                    isPast
                      ? "border-zinc-200 bg-zinc-50"
                      : "border-violet-200 bg-white"
                  } shadow-sm rounded-xl overflow-hidden`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isPast
                            ? "bg-zinc-200"
                            : "bg-gradient-to-br from-violet-400 to-purple-500"
                        }`}
                      >
                        <Calendar
                          className={`w-6 h-6 ${
                            isPast ? "text-zinc-500" : "text-white"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-[15px] font-semibold text-zinc-900">
                            {booking.vaccineName ||
                              booking.reason ||
                              "Appointment"}
                          </h3>
                          {booking.status && (
                            <span
                              className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                                booking.status === "confirmed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : booking.status === "cancelled"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-zinc-100 text-zinc-700"
                              }`}
                            >
                              {booking.status}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-zinc-600 mb-2">
                          {booking.hospitalName}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {format(slotDate, "MMM d, yyyy")}
                              {slotTime && ` at ${slotTime}`}
                            </span>
                          </div>
                          {booking.hospitalAddress && (
                            <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{booking.hospitalAddress}</span>
                            </div>
                          )}
                          {booking.patientPhone && (
                            <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{booking.patientPhone}</span>
                            </div>
                          )}
                        </div>
                        {booking.notes && (
                          <div className="mt-2 pt-2 border-t border-zinc-100">
                            <p className="text-[12px] text-zinc-500">
                              {booking.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Mira Button */}
      <MiraFab babyId={babyProfileId} />
    </div>
  );
}
