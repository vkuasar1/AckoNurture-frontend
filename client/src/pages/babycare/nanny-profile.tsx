import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Star,
  BadgeCheck,
  ShieldCheck,
  Heart,
  MapPin,
  Calendar,
  ChevronRight,
  Baby,
  Droplets,
  Moon,
  Sparkles,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MiraFab } from "@/components/MiraFab";

interface NannyProfile {
  id: string;
  name: string;
  avatarColor: string;
  yearsExperience: number;
  specialty: string;
  rating: number;
  reviewCount: number;
  bio: string;
  previousRoles: string[];
  services: string[];
  trustFlags: {
    idVerified: boolean;
    policeCheck: boolean;
    firstAidTrained: boolean;
    locationTracking: boolean;
  };
  reviews: {
    id: string;
    parentName: string;
    date: string;
    rating: number;
    text: string;
  }[];
  availableDates: string[];
}

const mockNannyData: Record<string, NannyProfile> = {
  "1": {
    id: "1",
    name: "Priya S.",
    avatarColor: "from-pink-400 to-rose-500",
    yearsExperience: 5,
    specialty: "Infant specialist",
    rating: 4.9,
    reviewCount: 142,
    bio: "I've been caring for babies and toddlers for over 5 years. Previously worked with families in Bangalore and Mumbai, specializing in newborn care and establishing healthy sleep routines.",
    previousRoles: [
      "Full-time nanny for 2 families",
      "Daycare assistant for 3 years",
      "Certified infant care specialist",
    ],
    services: [
      "Feeding support",
      "Bath & hygiene",
      "Sleep routines",
      "Play & early learning",
    ],
    trustFlags: {
      idVerified: true,
      policeCheck: true,
      firstAidTrained: true,
      locationTracking: true,
    },
    reviews: [
      {
        id: "r1",
        parentName: "Sneha M.",
        date: "2 weeks ago",
        rating: 5,
        text: "Priya is wonderful with our 6-month-old. She's patient, caring, and always keeps us updated. Highly recommend!",
      },
      {
        id: "r2",
        parentName: "Anand K.",
        date: "1 month ago",
        rating: 5,
        text: "Very professional and experienced. Our baby loves her. She helped us establish a great sleep routine.",
      },
      {
        id: "r3",
        parentName: "Meera R.",
        date: "2 months ago",
        rating: 4,
        text: "Great with infants. Punctual and reliable. Would book again.",
      },
    ],
    availableDates: ["Dec 10", "Dec 11", "Dec 12", "Dec 13", "Dec 14"],
  },
  "2": {
    id: "2",
    name: "Lakshmi D.",
    avatarColor: "from-violet-400 to-purple-500",
    yearsExperience: 8,
    specialty: "Toddler care expert",
    rating: 4.8,
    reviewCount: 98,
    bio: "With 8 years of experience, I specialize in toddler development and early learning activities. I believe in nurturing curiosity and building independence.",
    previousRoles: [
      "Preschool teacher for 4 years",
      "Full-time nanny for 3 families",
      "Early childhood development certified",
    ],
    services: [
      "Feeding support",
      "Bath & hygiene",
      "Sleep routines",
      "Play & early learning",
    ],
    trustFlags: {
      idVerified: true,
      policeCheck: true,
      firstAidTrained: true,
      locationTracking: true,
    },
    reviews: [
      {
        id: "r1",
        parentName: "Priya T.",
        date: "3 weeks ago",
        rating: 5,
        text: "Lakshmi is amazing! My toddler has learned so much since she started.",
      },
      {
        id: "r2",
        parentName: "Vikram S.",
        date: "1 month ago",
        rating: 5,
        text: "Very patient and creative with activities. Keeps our 2-year-old engaged.",
      },
    ],
    availableDates: ["Dec 11", "Dec 12", "Dec 14", "Dec 15", "Dec 16"],
  },
  "3": {
    id: "3",
    name: "Meera K.",
    avatarColor: "from-emerald-400 to-teal-500",
    yearsExperience: 3,
    specialty: "Newborn care",
    rating: 4.7,
    reviewCount: 56,
    bio: "Specializing in newborn care, I help new parents navigate the first few months with confidence. I'm trained in infant massage and lactation support assistance.",
    previousRoles: [
      "Maternity nurse assistant",
      "Newborn care specialist",
      "Infant massage certified",
    ],
    services: [
      "Feeding support",
      "Bath & hygiene",
      "Sleep routines",
      "Play & early learning",
    ],
    trustFlags: {
      idVerified: true,
      policeCheck: true,
      firstAidTrained: true,
      locationTracking: false,
    },
    reviews: [
      {
        id: "r1",
        parentName: "Deepa N.",
        date: "1 week ago",
        rating: 5,
        text: "Meera was a lifesaver during our first month with the baby!",
      },
      {
        id: "r2",
        parentName: "Rahul G.",
        date: "3 weeks ago",
        rating: 4,
        text: "Very gentle and knowledgeable about newborn care.",
      },
    ],
    availableDates: ["Dec 10", "Dec 11", "Dec 13", "Dec 15", "Dec 17"],
  },
  "4": {
    id: "4",
    name: "Anita R.",
    avatarColor: "from-amber-400 to-orange-500",
    yearsExperience: 6,
    specialty: "Sleep training",
    rating: 4.9,
    reviewCount: 187,
    bio: "I'm a certified sleep consultant who helps families establish healthy sleep patterns. With 6 years of experience, I've helped over 100 families get better rest.",
    previousRoles: [
      "Certified sleep consultant",
      "Night nanny specialist",
      "Parent educator",
    ],
    services: [
      "Feeding support",
      "Bath & hygiene",
      "Sleep routines",
      "Play & early learning",
    ],
    trustFlags: {
      idVerified: true,
      policeCheck: true,
      firstAidTrained: true,
      locationTracking: true,
    },
    reviews: [
      {
        id: "r1",
        parentName: "Kavita M.",
        date: "1 week ago",
        rating: 5,
        text: "Our baby now sleeps through the night thanks to Anita! She's a miracle worker.",
      },
      {
        id: "r2",
        parentName: "Suresh P.",
        date: "2 weeks ago",
        rating: 5,
        text: "Highly skilled in sleep training. Gentle methods that actually work.",
      },
      {
        id: "r3",
        parentName: "Nandini S.",
        date: "1 month ago",
        rating: 5,
        text: "Worth every penny. Life-changing results for our family.",
      },
    ],
    availableDates: ["Dec 12", "Dec 13", "Dec 14", "Dec 16", "Dec 18"],
  },
};

const serviceIcons: Record<string, React.ReactNode> = {
  "Feeding support": <Baby className="w-4 h-4" />,
  "Bath & hygiene": <Droplets className="w-4 h-4" />,
  "Sleep routines": <Moon className="w-4 h-4" />,
  "Play & early learning": <Sparkles className="w-4 h-4" />,
};

export default function NannyProfilePage() {
  const { babyId, nannyId } = useParams<{ babyId: string; nannyId: string }>();
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const nanny = mockNannyData[nannyId || "1"];

  if (!nanny) {
    return (
      <div className="app-container min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-500">Nanny not found</p>
      </div>
    );
  }

  const initials = nanny.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const handleBook = () => {
    setLocation(
      `/babycare/nanny-booking/${babyId}/${nannyId}?date=${selectedDate || nanny.availableDates[0]}`,
    );
  };

  return (
    <div className="app-container min-h-screen bg-zinc-50 flex flex-col">
      <div className="bg-white border-b border-zinc-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/babycare/nanny-matches/${babyId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-600" />
            </Button>
          </Link>
          <h1 className="text-[16px] font-semibold text-zinc-900">
            Nanny Profile
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="bg-white px-5 py-6 border-b border-zinc-100">
          <div className="flex items-start gap-4">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${nanny.avatarColor} flex items-center justify-center flex-shrink-0 shadow-lg`}
            >
              <span className="text-white font-bold text-2xl">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[20px] font-bold text-zinc-900 mb-1">
                {nanny.name}
              </h2>
              <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-[12px] font-medium mb-2">
                {nanny.specialty}
              </Badge>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-[15px] font-semibold text-zinc-800">
                  {nanny.rating}
                </span>
                <span className="text-[13px] text-zinc-500">
                  ({nanny.reviewCount} reviews)
                </span>
              </div>
              <p className="text-[13px] text-zinc-500 mt-1">
                {nanny.yearsExperience} years experience
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white px-5 py-5 border-b border-zinc-100 mt-2">
          <h3 className="text-[15px] font-semibold text-zinc-900 mb-3">
            About
          </h3>
          <p className="text-[14px] text-zinc-600 leading-relaxed mb-4">
            {nanny.bio}
          </p>
          <div className="space-y-2">
            {nanny.previousRoles.map((role, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                <span className="text-[13px] text-zinc-600">{role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white px-5 py-5 border-b border-zinc-100 mt-2">
          <h3 className="text-[15px] font-semibold text-zinc-900 mb-3">
            Services offered
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {nanny.services.map((service) => (
              <div
                key={service}
                className="flex items-center gap-2 bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100"
              >
                <div className="text-violet-600">
                  {serviceIcons[service] || <Sparkles className="w-4 h-4" />}
                </div>
                <span className="text-[13px] text-zinc-700 font-medium">
                  {service}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-600 to-pink-500 mx-4 mt-4 rounded-2xl p-4 shadow-lg">
          <h3 className="text-[15px] font-semibold text-white mb-3">
            Trust & Safety
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {nanny.trustFlags.idVerified && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
                <span className="text-[12px] text-white font-medium">
                  ID verified
                </span>
              </div>
            )}
            {nanny.trustFlags.policeCheck && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="text-[12px] text-white font-medium">
                  Police verified
                </span>
              </div>
            )}
            {nanny.trustFlags.firstAidTrained && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-[12px] text-white font-medium">
                  First-aid trained
                </span>
              </div>
            )}
            {nanny.trustFlags.locationTracking && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-[12px] text-white font-medium">
                  Location tracking
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white px-5 py-5 border-b border-zinc-100 mt-4">
          <h3 className="text-[15px] font-semibold text-zinc-900 mb-3">
            Reviews
          </h3>
          {nanny.reviews.slice(0, 1).map((review) => (
            <div
              key={review.id}
              className="bg-zinc-50 rounded-xl p-3 border border-zinc-100"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium text-zinc-800">
                  {review.parentName}
                </span>
                <span className="text-[11px] text-zinc-400">{review.date}</span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-zinc-200"}`}
                  />
                ))}
              </div>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
          {nanny.reviews.length > 1 && (
            <button
              className="w-full mt-3 py-2.5 text-[13px] text-violet-600 font-medium flex items-center justify-center gap-1 bg-violet-50 rounded-xl border border-violet-100"
              data-testid="button-see-more-reviews"
            >
              See more reviews ({nanny.reviews.length - 1} more)
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="bg-white px-5 py-5 mt-2">
          <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">
            Select a date
          </h3>
          <p className="text-[12px] text-zinc-500 mb-3">Next available dates</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {nanny.availableDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl text-[13px] font-medium border transition-all ${
                  selectedDate === date
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-zinc-700 border-zinc-200"
                }`}
                data-testid={`date-${date}`}
              >
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {date}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleBook}
            className="w-full h-14 rounded-2xl text-[15px] font-semibold gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white"
            data-testid="button-book-nanny"
          >
            Schedule with {nanny.name}
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <MiraFab babyId={babyId} />
    </div>
  );
}
