import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  ArrowLeft,
  ChevronRight,
  Check,
  PawPrint,
  Clock,
  Calendar,
  Heart,
  MessageCircle,
  Award,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  UserCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MiraFab } from "@/components/MiraFab";

const durationOptions = [
  { id: "1-day", label: "1 day" },
  { id: "3-10-days", label: "3–10 days" },
  { id: "1-3-months", label: "1–3 months" },
  { id: "3-plus-months", label: "3+ months" },
];

const timingOptions = [
  { id: "daytime", label: "Daytime" },
  { id: "nights", label: "Nights" },
  { id: "live-in", label: "Live-in" },
  { id: "weekends", label: "Weekends" },
  { id: "emergency", label: "Emergency" },
];

const helpWithOptions = [
  { id: "feeding", label: "Feeding" },
  { id: "bathing", label: "Bathing & diapers" },
  { id: "sleep", label: "Sleep support" },
  { id: "play", label: "Play & learning" },
  { id: "laundry", label: "Light cleaning" },
];

const languageOptions = [
  { id: "english", label: "English" },
  { id: "hindi", label: "Hindi" },
  { id: "kannada", label: "Kannada" },
  { id: "tamil", label: "Tamil" },
  { id: "telugu", label: "Telugu" },
];

const experienceOptions = [
  { id: "0-2", label: "0–2 yrs" },
  { id: "3-5", label: "3–5 yrs" },
  { id: "5-plus", label: "5+ yrs" },
];

const trustMessages = [
  {
    icon: ShieldCheck,
    text: "All nannies are Acko verified",
    color: "text-emerald-500",
  },
  {
    icon: BadgeCheck,
    text: "Background checks completed",
    color: "text-violet-500",
  },
  {
    icon: Star,
    text: "Trained in infant & child care",
    color: "text-amber-500",
  },
  {
    icon: UserCheck,
    text: "References verified by our team",
    color: "text-pink-500",
  },
  {
    icon: Heart,
    text: "Finding the best match for your family",
    color: "text-rose-500",
  },
];

interface ChipGroupProps {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  colorScheme?: "violet" | "pink" | "emerald" | "amber";
}

function ChipGroup({
  options,
  selected,
  onToggle,
  colorScheme = "violet",
}: ChipGroupProps) {
  const colorClasses = {
    violet: "bg-violet-600 border-violet-600",
    pink: "bg-pink-500 border-pink-500",
    emerald: "bg-emerald-500 border-emerald-500",
    amber: "bg-amber-500 border-amber-500",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            className={`
              px-3.5 py-2 rounded-full text-[13px] font-medium border-2 transition-all
              ${
                isSelected
                  ? `${colorClasses[colorScheme]} text-white shadow-sm`
                  : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
              }
            `}
            data-testid={`chip-${option.id}`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 inline mr-1" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  required?: boolean;
  children: React.ReactNode;
  bgColor?: string;
}

function Section({
  icon,
  title,
  required,
  children,
  bgColor = "bg-white",
}: SectionProps) {
  return (
    <div className={`${bgColor} rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-[14px] font-semibold text-zinc-800">{title}</h3>
        {required && (
          <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">
            Required
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function LoadingOverlay({ onComplete }: { onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < trustMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-violet-50 to-pink-50 z-50 flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-violet-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-violet-200 animate-pulse">
        <Sparkles className="w-10 h-10 text-white" />
      </div>

      <h2 className="text-[22px] font-bold text-zinc-900 mb-2 text-center">
        Finding your perfect nanny
      </h2>
      <p className="text-[14px] text-zinc-500 mb-10 text-center">
        Matching based on your preferences...
      </p>

      <div className="w-full max-w-xs space-y-4 mb-10">
        {trustMessages.map((msg, index) => {
          const Icon = msg.icon;
          const isVisible = index <= currentIndex;
          const isActive = index === currentIndex;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? "bg-white shadow-md scale-110" : "bg-white/60"
                }`}
              >
                <Icon className={`w-5 h-5 ${msg.color}`} />
              </div>
              <span
                className={`text-[14px] transition-all ${
                  isActive ? "text-zinc-900 font-medium" : "text-zinc-600"
                }`}
              >
                {msg.text}
              </span>
              {index < currentIndex && (
                <Check className="w-4 h-4 text-emerald-500 ml-auto" />
              )}
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-xs">
        <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-violet-600 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[12px] text-zinc-400 text-center mt-2">
          {progress}% complete
        </p>
      </div>
    </div>
  );
}

export default function NannyNeedsPage() {
  const { babyId } = useParams<{ babyId: string }>();
  const [, setLocation] = useLocation();

  const [duration, setDuration] = useState<string[]>([]);
  const [timing, setTiming] = useState<string[]>([]);
  const [helpWith, setHelpWith] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [comfortableWithPets, setComfortableWithPets] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSingleSelect =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (id: string) => {
      setter([id]);
    };

  const handleMultiSelect =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (id: string) => {
      setter((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    };

  const isValid = duration.length > 0 && timing.length > 0;

  const handleSeeMatches = () => {
    const needs = {
      duration: duration[0],
      timing,
      helpWith,
      languages,
      experience,
      comfortableWithPets,
    };
    console.log("Nanny needs:", needs);
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    setLocation(`/babycare/nanny-matches/${babyId}`);
  };

  if (isLoading) {
    return <LoadingOverlay onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="app-container min-h-screen bg-gradient-to-b from-violet-50 to-pink-50 flex flex-col">
      <div className="bg-white/80 backdrop-blur-sm border-b border-zinc-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/babycare/nanny/${babyId}`}>
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
            Find a Nanny
          </h1>
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-6 overflow-y-auto mb-24">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-200">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-[20px] font-bold text-zinc-900 mb-1">
            Let's find your perfect match
          </h2>
          <p className="text-[13px] text-zinc-500">
            Tell us what you need, we'll do the rest
          </p>
        </div>

        <div className="space-y-3">
          <Section
            icon={<Calendar className="w-4 h-4 text-violet-500" />}
            title="How long do you need help?"
            required
            bgColor="bg-white"
          >
            <ChipGroup
              options={durationOptions}
              selected={duration}
              onToggle={handleSingleSelect(setDuration)}
              colorScheme="violet"
            />
          </Section>

          <Section
            icon={<Clock className="w-4 h-4 text-pink-500" />}
            title="When do you need help?"
            required
            bgColor="bg-white"
          >
            <ChipGroup
              options={timingOptions}
              selected={timing}
              onToggle={handleMultiSelect(setTiming)}
              colorScheme="pink"
            />
          </Section>

          <Section
            icon={<Heart className="w-4 h-4 text-emerald-500" />}
            title="What should they help with?"
            bgColor="bg-white"
          >
            <ChipGroup
              options={helpWithOptions}
              selected={helpWith}
              onToggle={handleMultiSelect(setHelpWith)}
              colorScheme="emerald"
            />
          </Section>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-[14px] font-semibold text-zinc-800">
                Preferences
              </h3>
              <span className="text-[10px] text-zinc-400 font-medium">
                Optional
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <h4 className="text-[12px] font-medium text-zinc-500 uppercase tracking-wide">
                    Languages
                  </h4>
                </div>
                <ChipGroup
                  options={languageOptions}
                  selected={languages}
                  onToggle={handleMultiSelect(setLanguages)}
                  colorScheme="amber"
                />
              </div>

              <div>
                <h4 className="text-[12px] font-medium text-zinc-500 uppercase tracking-wide mb-2">
                  Experience
                </h4>
                <ChipGroup
                  options={experienceOptions}
                  selected={experience}
                  onToggle={handleMultiSelect(setExperience)}
                  colorScheme="amber"
                />
              </div>

              <div className="flex items-center justify-between py-3 px-3 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <PawPrint className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-[14px] text-zinc-700 font-medium">
                    Comfortable with pets
                  </span>
                </div>
                <Switch
                  checked={comfortableWithPets}
                  onCheckedChange={setComfortableWithPets}
                  data-testid="switch-pets"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-0 px-4 pb-6 pt-4 bg-white">
        {!isValid && (
          <p className="text-[12px] text-zinc-400 text-center mb-3">
            Select duration and timing to continue
          </p>
        )}
        <Button
          onClick={handleSeeMatches}
          disabled={!isValid}
          className="w-full h-14 rounded-2xl text-[15px] font-semibold gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-lg shadow-violet-200 disabled:opacity-50 disabled:shadow-none"
          data-testid="button-see-matches"
        >
          See matches
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <MiraFab babyId={babyId} />
    </div>
  );
}
