import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, ChevronRight, Star, ShieldCheck, BadgeCheck, MapPin, Camera, Filter, ChevronDown, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  distanceKm: number;
  languages: string[];
  trustFlags: {
    idVerified: boolean;
    policeCheck: boolean;
    locationTracking: boolean;
    cameraFriendly: boolean;
  };
  previouslyBooked: boolean;
}

const mockNannies: NannyProfile[] = [
  {
    id: "1",
    name: "Priya S.",
    avatarColor: "from-pink-400 to-rose-500",
    yearsExperience: 5,
    specialty: "Infant specialist",
    rating: 4.9,
    reviewCount: 142,
    distanceKm: 2.5,
    languages: ["English", "Hindi", "Kannada"],
    trustFlags: {
      idVerified: true,
      policeCheck: true,
      locationTracking: true,
      cameraFriendly: true,
    },
    previouslyBooked: true,
  },
  {
    id: "2",
    name: "Lakshmi D.",
    avatarColor: "from-violet-400 to-purple-500",
    yearsExperience: 8,
    specialty: "Toddler care expert",
    rating: 4.8,
    reviewCount: 98,
    distanceKm: 3.2,
    languages: ["English", "Tamil", "Telugu"],
    trustFlags: {
      idVerified: true,
      policeCheck: true,
      locationTracking: true,
      cameraFriendly: false,
    },
    previouslyBooked: false,
  },
  {
    id: "3",
    name: "Meera K.",
    avatarColor: "from-emerald-400 to-teal-500",
    yearsExperience: 3,
    specialty: "Newborn care",
    rating: 4.7,
    reviewCount: 56,
    distanceKm: 1.8,
    languages: ["English", "Hindi"],
    trustFlags: {
      idVerified: true,
      policeCheck: true,
      locationTracking: false,
      cameraFriendly: true,
    },
    previouslyBooked: false,
  },
  {
    id: "4",
    name: "Anita R.",
    avatarColor: "from-amber-400 to-orange-500",
    yearsExperience: 6,
    specialty: "Sleep training",
    rating: 4.9,
    reviewCount: 187,
    distanceKm: 4.1,
    languages: ["English", "Kannada"],
    trustFlags: {
      idVerified: true,
      policeCheck: true,
      locationTracking: true,
      cameraFriendly: true,
    },
    previouslyBooked: false,
  },
];

type SortOption = "rating" | "experience" | "distance";

const sortOptions: { id: SortOption; label: string }[] = [
  { id: "rating", label: "Highest rated" },
  { id: "experience", label: "Most experienced" },
  { id: "distance", label: "Nearest" },
];

interface TrustChipProps {
  icon: React.ReactNode;
  label: string;
}

function TrustChip({ icon, label }: TrustChipProps) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
      {icon}
      {label}
    </div>
  );
}

interface NannyCardProps {
  nanny: NannyProfile;
  babyId: string;
}

function NannyCard({ nanny, babyId }: NannyCardProps) {
  const initials = nanny.name.split(" ").map(n => n[0]).join("");

  return (
    <Link href={`/babycare/nanny-profile/${babyId}/${nanny.id}`}>
      <div 
        className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow cursor-pointer"
        data-testid={`card-nanny-${nanny.id}`}
      >
        {nanny.previouslyBooked && (
          <div className="mb-3">
            <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-[10px] font-medium">
              Previously booked
            </Badge>
          </div>
        )}

        <div className="flex gap-3 mb-3">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${nanny.avatarColor} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-[16px]">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-zinc-900 mb-0.5">{nanny.name}</h3>
            <p className="text-[13px] text-zinc-500">
              {nanny.yearsExperience} yrs • {nanny.specialty}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-[13px] font-medium text-zinc-700">{nanny.rating}</span>
              <span className="text-[12px] text-zinc-400">({nanny.reviewCount})</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-300 self-center flex-shrink-0" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {nanny.trustFlags.idVerified && (
            <TrustChip icon={<BadgeCheck className="w-3 h-3" />} label="ID verified" />
          )}
          {nanny.trustFlags.policeCheck && (
            <TrustChip icon={<ShieldCheck className="w-3 h-3" />} label="Police check" />
          )}
          {nanny.trustFlags.locationTracking && (
            <TrustChip icon={<MapPin className="w-3 h-3" />} label="Tracking" />
          )}
          {nanny.trustFlags.cameraFriendly && (
            <TrustChip icon={<Camera className="w-3 h-3" />} label="Camera OK" />
          )}
        </div>
      </div>
    </Link>
  );
}

export default function NannyMatchesPage() {
  const { babyId } = useParams<{ babyId: string }>();
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [filterOpen, setFilterOpen] = useState(false);
  const [experienceFilter, setExperienceFilter] = useState<string[]>([]);
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);

  const experienceOptions = ["0-2", "3-5", "5+"];
  const languageOptions = ["English", "Hindi", "Kannada", "Tamil", "Telugu"];

  const filteredNannies = mockNannies
    .filter((nanny) => {
      if (experienceFilter.length > 0) {
        const exp = nanny.yearsExperience;
        const matchesExp = experienceFilter.some((f) => {
          if (f === "0-2") return exp <= 2;
          if (f === "3-5") return exp >= 3 && exp <= 5;
          if (f === "5+") return exp > 5;
          return false;
        });
        if (!matchesExp) return false;
      }
      if (languageFilter.length > 0) {
        const hasLanguage = languageFilter.some((lang) => nanny.languages.includes(lang));
        if (!hasLanguage) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "experience":
          return b.yearsExperience - a.yearsExperience;
        case "distance":
          return a.distanceKm - b.distanceKm;
        default:
          return 0;
      }
    });

  const activeFilters = experienceFilter.length + languageFilter.length;

  const toggleFilter = (list: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const clearFilters = () => {
    setExperienceFilter([]);
    setLanguageFilter([]);
  };

  return (
    <div className="app-container min-h-screen bg-zinc-50 flex flex-col">
      <div className="bg-white border-b border-zinc-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/babycare/nanny-needs/${babyId}`}>
            <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 text-zinc-600" />
            </Button>
          </Link>
          <h1 className="text-[16px] font-semibold text-zinc-900">Nanny Matches</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        <h2 className="text-[18px] font-bold text-zinc-900 mb-1">
          Here are the best matches for your family
        </h2>
        <p className="text-[13px] text-zinc-500 mb-4">
          {filteredNannies.length} nannies available
        </p>

        <div className="flex gap-2 mb-4">
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full gap-1.5"
                data-testid="button-filter"
              >
                <Filter className="w-4 h-4" />
                Filter
                {activeFilters > 0 && (
                  <span className="bg-violet-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {activeFilters}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetHeader>
                <SheetTitle className="text-left">Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-5">
                <div>
                  <h4 className="text-[13px] font-medium text-zinc-700 mb-2">Experience</h4>
                  <div className="flex flex-wrap gap-2">
                    {experienceOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => toggleFilter(experienceFilter, opt, setExperienceFilter)}
                        className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                          experienceFilter.includes(opt)
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-zinc-600 border-zinc-200"
                        }`}
                        data-testid={`filter-exp-${opt}`}
                      >
                        {opt} yrs
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[13px] font-medium text-zinc-700 mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => toggleFilter(languageFilter, lang, setLanguageFilter)}
                        className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                          languageFilter.includes(lang)
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-zinc-600 border-zinc-200"
                        }`}
                        data-testid={`filter-lang-${lang}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearFilters}
                    data-testid="button-clear-filters"
                  >
                    Clear all
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-pink-500 to-violet-600 text-white"
                    onClick={() => setFilterOpen(false)}
                    data-testid="button-apply-filters"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white border border-zinc-200 rounded-full px-3 pr-8 py-1.5 text-[13px] font-medium text-zinc-700 cursor-pointer"
              data-testid="select-sort"
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {activeFilters > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {experienceFilter.map((exp) => (
              <button
                key={exp}
                onClick={() => toggleFilter(experienceFilter, exp, setExperienceFilter)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-[12px] font-medium"
              >
                {exp} yrs
                <X className="w-3 h-3" />
              </button>
            ))}
            {languageFilter.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleFilter(languageFilter, lang, setLanguageFilter)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-[12px] font-medium"
              >
                {lang}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {filteredNannies.map((nanny) => (
            <NannyCard key={nanny.id} nanny={nanny} babyId={babyId || ""} />
          ))}

          {filteredNannies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500 text-[14px]">No nannies match your filters.</p>
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-violet-600 mt-2"
                data-testid="button-clear-filters-empty"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <MiraFab babyId={babyId} />
    </div>
  );
}
