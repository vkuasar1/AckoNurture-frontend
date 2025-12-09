import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Baby, BadgeCheck, ChevronRight, Shield, UserCheck, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BabyProfile } from "@shared/schema";
import nannyImg1 from "@assets/stock_images/professional_female__d0c0f3f3.jpg";
import nannyImg2 from "@assets/stock_images/professional_female__e07ecb2f.jpg";
import nannyImg3 from "@assets/stock_images/professional_female__9ea05cdd.jpg";
import { MiraFab } from "@/components/MiraFab";

function calculateBabyAgeInMonths(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                 (today.getMonth() - birthDate.getMonth());
  const dayDiff = today.getDate() - birthDate.getDate();
  return dayDiff < 0 ? Math.max(0, months - 1) : months;
}

function getAgeDisplayText(ageInMonths: number): string {
  if (ageInMonths < 1) return "newborn";
  if (ageInMonths === 1) return "1 month old";
  if (ageInMonths < 12) return `${ageInMonths} month old`;
  const years = Math.floor(ageInMonths / 12);
  const remainingMonths = ageInMonths % 12;
  if (remainingMonths === 0) {
    return years === 1 ? "1 year old" : `${years} year old`;
  }
  return `${years}y ${remainingMonths}m old`;
}

interface NannyBooking {
  nannyName: string;
  nannyInitials: string;
  shiftType: string;
  shiftHours: string;
  startTime: string;
  endTime: string;
  isOnDuty: boolean;
  bookingId: string;
}

export default function NannyRecommendation() {
  const { babyId } = useParams<{ babyId: string }>();
  const [, setLocation] = useLocation();
  const [hasBooking, setHasBooking] = useState(false);
  const [booking, setBooking] = useState<NannyBooking | null>(null);

  const { data: baby, isLoading } = useQuery<BabyProfile>({
    queryKey: ["/api/baby-profiles", babyId],
    enabled: !!babyId,
  });

  useEffect(() => {
    const storedBooking = localStorage.getItem(`nanny_booking_${babyId}`);
    if (storedBooking) {
      setBooking(JSON.parse(storedBooking));
      setHasBooking(true);
    }
  }, [babyId]);

  const ageInMonths = baby?.dob ? calculateBabyAgeInMonths(baby.dob) : 0;
  const ageDisplayText = getAgeDisplayText(ageInMonths);

  const handleContinue = () => {
    setLocation(`/babycare/nanny-needs/${babyId}`);
  };

  const handleViewDashboard = () => {
    setLocation(`/babycare/nanny-dashboard/${babyId}`);
  };

  if (isLoading) {
    return (
      <div className="app-container min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (hasBooking && booking) {
    return (
      <div className="app-container min-h-screen bg-white flex flex-col">
        <div className="border-b border-zinc-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/babycare/home/${babyId}`}>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back">
                <ArrowLeft className="w-5 h-5 text-zinc-600" />
              </Button>
            </Link>
            <h1 className="text-[16px] font-semibold text-zinc-900">Nanny Care</h1>
          </div>
        </div>

        <div className="flex-1 px-5 pt-6 pb-6">
          <Card 
            className="border-violet-200 bg-gradient-to-br from-violet-50 to-pink-50 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleViewDashboard}
            data-testid="card-nanny-today"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{booking.nannyInitials}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[16px] font-semibold text-zinc-900">{booking.nannyName}</h3>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      booking.isOnDuty 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-zinc-100 text-zinc-500"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        booking.isOnDuty ? "bg-emerald-500" : "bg-zinc-400"
                      }`} />
                      {booking.isOnDuty ? "On Duty" : "Off Duty"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-[12px] text-zinc-500">
                      <Clock className="w-3.5 h-3.5" />
                      {booking.shiftType} ({booking.shiftHours})
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h3 className="text-[14px] font-semibold text-zinc-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={handleViewDashboard}
                data-testid="button-view-details"
              >
                <Clock className="w-5 h-5 text-violet-500" />
                <span className="text-[12px]">View Details</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => window.open("tel:+919876543210")}
                data-testid="button-call-nanny"
              >
                <Phone className="w-5 h-5 text-violet-500" />
                <span className="text-[12px]">Call Nanny</span>
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[13px] text-zinc-500 text-center mb-4">
              Need a different nanny or have questions?
            </p>
            <Button
              variant="outline"
              onClick={handleContinue}
              className="w-full h-12 rounded-xl text-[14px] font-medium"
              data-testid="button-find-another"
            >
              Find Another Nanny
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen bg-white flex flex-col">
      <div className="border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/babycare/home/${babyId}`}>
            <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 text-zinc-600" />
            </Button>
          </Link>
          <h1 className="text-[16px] font-semibold text-zinc-900">Nanny Care</h1>
        </div>
      </div>

      <div className="flex-1 px-5 pt-8 pb-6 flex flex-col">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-[22px] font-bold text-zinc-900 mb-2">
            Nannies ready to care for your child
          </h2>
          <p className="text-[14px] text-zinc-500">
            Verified. Trained. At your service.
          </p>
        </div>

        <div className="mb-5">
          <p className="text-[16px] text-zinc-700 leading-relaxed">
            For your <span className="font-semibold">{ageDisplayText}</span> child, we've curated nannies trained for their specific needs.
          </p>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 aspect-square rounded-xl overflow-hidden">
            <img src={nannyImg1} alt="Trusted nanny" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 aspect-square rounded-xl overflow-hidden">
            <img src={nannyImg2} alt="Trusted nanny" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 aspect-square rounded-xl overflow-hidden">
            <img src={nannyImg3} alt="Trusted nanny" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl p-4 mb-5 border border-violet-100">
          <p className="text-[13px] text-zinc-700 text-center leading-relaxed">
            Lots of great options await — <span className="font-semibold text-violet-700">explore freely</span> until you find your perfect nanny match.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-full text-[12px] font-medium border border-emerald-100">
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified
          </div>
          <div className="flex items-center gap-1.5 bg-violet-50 text-violet-700 px-3 py-2 rounded-full text-[12px] font-medium border border-violet-100">
            <Shield className="w-3.5 h-3.5" />
            Trained
          </div>
          <div className="flex items-center gap-1.5 bg-pink-50 text-pink-700 px-3 py-2 rounded-full text-[12px] font-medium border border-pink-100">
            <UserCheck className="w-3.5 h-3.5" />
            Acko Trusted
          </div>
        </div>

        <div className="flex-1" />

        <p className="text-[13px] text-zinc-500 leading-relaxed text-center mb-4">
          In the next steps, we'll guide you to find the nanny that suits you and your baby best.
        </p>

        <Button
          onClick={handleContinue}
          className="w-full h-14 rounded-2xl text-[15px] font-semibold gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white"
          data-testid="button-continue"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <MiraFab babyId={babyId} />
    </div>
  );
}
