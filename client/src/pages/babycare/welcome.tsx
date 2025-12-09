import { Link, useLocation, useSearch } from "wouter";
import {
  Baby,
  Heart,
  Sparkles,
  ArrowRight,
  Star,
  Building2,
  QrCode,
  Keyboard,
  Scan,
  CheckCircle2,
  Loader2,
  Flower2,
  Moon,
  Stethoscope,
  User,
  Check,
  ArrowLeft,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProfiles, type Profile } from "@/lib/profileApi";
import { getUserId } from "@/lib/userId";

type OnboardingSelection = "baby" | "mother";
type OnboardingStep = "welcome" | "selection";

interface HospitalRegistration {
  babyName: string;
  dob: string;
  gender: "boy" | "girl";
  hospitalName: string;
  caregiverName: string;
  caregiverRole: "mother" | "father";
}

const MOCK_HOSPITAL_CODES: Record<string, HospitalRegistration> = {
  APOLLO2024: {
    babyName: "Aarav Sharma",
    dob: "2025-09-09",
    gender: "boy",
    hospitalName: "Apollo Cradle Hospital",
    caregiverName: "Priya Sharma",
    caregiverRole: "mother",
  },
  FORTIS2024: {
    babyName: "Ananya Gupta",
    dob: "2025-09-09",
    gender: "girl",
    hospitalName: "Fortis La Femme",
    caregiverName: "Meera Gupta",
    caregiverRole: "mother",
  },
  MAX2024: {
    babyName: "Vihaan Singh",
    dob: "2025-09-09",
    gender: "boy",
    hospitalName: "Max Super Speciality",
    caregiverName: "Rahul Singh",
    caregiverRole: "father",
  },
};

export default function BabyCareWelcome() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const isSkipInProgress = useRef(false);
  const [showHospitalDialog, setShowHospitalDialog] = useState(false);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState<"scanning" | "found" | "idle">(
    "idle",
  );
  const [registrationCode, setRegistrationCode] = useState("");
  const [codeError, setCodeError] = useState("");

  // Check for query parameter to show selection screen directly
  const params = new URLSearchParams(searchString);
  const initialStep =
    params.get("step") === "selection" ? "selection" : "welcome";

  // Onboarding step state
  const [onboardingStep, setOnboardingStep] =
    useState<OnboardingStep>(initialStep);
  const [selectedOptions, setSelectedOptions] = useState<
    Set<OnboardingSelection>
  >(new Set());

  // Fetch profiles from API using userId from cookies
  const userId = getUserId();
  const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery<
    Profile[]
  >({
    queryKey: [`/api/v1/profiles/user/${userId}`],
    queryFn: () => getProfiles(),
  });

  // Filter for baby profiles
  const babyProfiles = profiles.filter((p) => p.type === "baby");

  // Auto-redirect to home if user has already completed onboarding (has profiles)
  useEffect(() => {
    // Only redirect if we're on the welcome page (not explicitly on selection)
    // and the user has existing baby profiles
    if (
      !isLoadingProfiles &&
      babyProfiles.length > 0 &&
      initialStep !== "selection"
    ) {
      const firstBaby = babyProfiles[0];
      const babyId = firstBaby.profileId || firstBaby.id;
      setLocation(`/babycare/home/${babyId}`);
    }
  }, [babyProfiles, isLoadingProfiles, initialStep, setLocation]);

  const createDemoProfile = useMutation({
    mutationFn: async () => {
      const demoProfile = {
        type: "baby" as const,
        name: "Demo Baby",
        dob: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        gender: "boy" as const,
      };
      const res = await apiRequest("POST", "/api/v1/profiles", {
        ...demoProfile,
        userId,
      });
      return res.json();
    },
    onSuccess: (newProfile: Profile) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/v1/profiles/user/${userId}`],
      });
      const babyId = newProfile.profileId || newProfile.id;
      setLocation(`/babycare/home/${babyId}`);
    },
    onError: () => {
      setLocation("/babycare/setup");
    },
    onSettled: () => {
      isSkipInProgress.current = false;
    },
  });

  const handleContinue = () => {
    if (babyProfiles.length > 0) {
      const firstBaby = babyProfiles[0];
      const babyId = firstBaby.profileId || firstBaby.id;
      setLocation(`/babycare/home/${babyId}`);
    } else {
      // Go directly to unified onboarding flow
      setLocation("/babycare/onboarding");
    }
  };

  const toggleSelection = (option: OnboardingSelection) => {
    const newSelection = new Set(selectedOptions);
    if (newSelection.has(option)) {
      newSelection.delete(option);
    } else {
      newSelection.add(option);
    }
    setSelectedOptions(newSelection);
  };

  const handleSelectionContinue = () => {
    // Route to unified onboarding flow
    setLocation("/babycare/onboarding");
  };

  const handleSkip = () => {
    if (babyProfiles.length > 0) {
      const firstBaby = babyProfiles[0];
      const babyId = firstBaby.profileId || firstBaby.id;
      setLocation(`/babycare/home/${babyId}`);
      return;
    }
    if (isSkipInProgress.current) {
      return;
    }
    isSkipInProgress.current = true;
    createDemoProfile.mutate();
  };

  const handleHospitalOption = () => {
    setShowHospitalDialog(true);
  };

  const handleScanCode = () => {
    setShowHospitalDialog(false);
    setShowScanner(true);
    setScanStatus("scanning");
  };

  const handleEnterCode = () => {
    setShowHospitalDialog(false);
    setShowCodeEntry(true);
  };

  useEffect(() => {
    if (showScanner && scanStatus === "scanning") {
      const timer = setTimeout(() => {
        setScanStatus("found");
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (showScanner && scanStatus === "found") {
      const timer = setTimeout(() => {
        const registration = MOCK_HOSPITAL_CODES["APOLLO2024"];
        setShowScanner(false);
        setScanStatus("idle");
        const params = new URLSearchParams({
          babyName: registration.babyName,
          dob: registration.dob,
          gender: registration.gender,
          hospital: registration.hospitalName,
          caregiverName: registration.caregiverName,
          caregiverRole: registration.caregiverRole,
          onboardingType: "hospital",
        });
        setLocation(`/babycare/onboarding?${params.toString()}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showScanner, scanStatus, setLocation]);

  const handleVerifyCode = () => {
    const code = registrationCode.trim().toUpperCase();
    const registration = MOCK_HOSPITAL_CODES[code];

    if (registration) {
      setCodeError("");
      setShowCodeEntry(false);
      setRegistrationCode("");
      const params = new URLSearchParams({
        babyName: registration.babyName,
        dob: registration.dob,
        gender: registration.gender,
        hospital: registration.hospitalName,
        caregiverName: registration.caregiverName,
        caregiverRole: registration.caregiverRole,
        onboardingType: "hospital",
      });
      setLocation(`/babycare/onboarding?${params.toString()}`);
    } else {
      setCodeError("Invalid registration code. Please check and try again.");
    }
  };

  // Show loading state while checking for existing profiles
  // This prevents a flash of the welcome screen before redirecting
  if (isLoadingProfiles) {
    return (
      <div className="app-container min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-[14px] text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Selection Screen Component
  if (onboardingStep === "selection") {
    return (
      <div className="app-container min-h-screen bg-zinc-50 flex flex-col">
        {/* Header */}
        <div className="bg-[#1a1a1a] text-white px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOnboardingStep("welcome")}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-9 w-9"
              data-testid="button-back-selection"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-[13px] font-medium bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Nurture
            </span>
            <div className="w-9" />
          </div>
        </div>

        {/* Selection Content */}
        <div className="flex-1 px-6 pt-8 pb-6 flex flex-col">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-[28px] font-bold text-zinc-900 leading-tight mb-2">
              What would you like
              <br />
              to track?
            </h1>
            <p className="text-[15px] text-zinc-500 mb-8">
              Whether you're a parent, grandparent, or caregiver — we've got you
              covered.
            </p>
          </motion.div>

          {/* Selection Cards */}
          <div className="space-y-4 flex-1">
            {/* Baby Card */}
            <motion.button
              onClick={() => toggleSelection("baby")}
              className={`w-full relative overflow-hidden rounded-2xl p-5 text-left transition-all ${
                selectedOptions.has("baby")
                  ? "bg-gradient-to-br from-violet-500 to-purple-600 ring-2 ring-violet-300"
                  : "bg-white border-2 border-zinc-200 hover:border-violet-300"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              data-testid="card-select-baby"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    selectedOptions.has("baby")
                      ? "bg-white/20"
                      : "bg-violet-100"
                  }`}
                >
                  <Baby
                    className={`w-8 h-8 ${
                      selectedOptions.has("baby")
                        ? "text-white"
                        : "text-violet-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-[18px] font-bold mb-1 ${
                      selectedOptions.has("baby")
                        ? "text-white"
                        : "text-zinc-900"
                    }`}
                  >
                    Baby Care
                  </h3>
                  <p
                    className={`text-[13px] leading-snug ${
                      selectedOptions.has("baby")
                        ? "text-white/80"
                        : "text-zinc-500"
                    }`}
                  >
                    Track vaccines, growth, milestones & get AI guidance for
                    your child
                  </p>
                </div>
                {selectedOptions.has("baby") && (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              {/* Decorative elements */}
              {selectedOptions.has("baby") && (
                <>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                </>
              )}
            </motion.button>

            {/* Caregiver Card */}
            <motion.button
              onClick={() => toggleSelection("mother")}
              className={`w-full relative overflow-hidden rounded-2xl p-5 text-left transition-all ${
                selectedOptions.has("mother")
                  ? "bg-gradient-to-br from-pink-500 to-rose-600 ring-2 ring-pink-300"
                  : "bg-white border-2 border-zinc-200 hover:border-pink-300"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              data-testid="card-select-mother"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    selectedOptions.has("mother")
                      ? "bg-white/20"
                      : "bg-pink-100"
                  }`}
                >
                  <Heart
                    className={`w-8 h-8 ${
                      selectedOptions.has("mother")
                        ? "text-white"
                        : "text-pink-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-[18px] font-bold mb-1 ${
                      selectedOptions.has("mother")
                        ? "text-white"
                        : "text-zinc-900"
                    }`}
                  >
                    My Wellness
                  </h3>
                  <p
                    className={`text-[13px] leading-snug ${
                      selectedOptions.has("mother")
                        ? "text-white/80"
                        : "text-zinc-500"
                    }`}
                  >
                    Self-care, wellness tips & support for caregivers
                  </p>
                </div>
                {selectedOptions.has("mother") && (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              {/* Decorative elements */}
              {selectedOptions.has("mother") && (
                <>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                </>
              )}
            </motion.button>
          </div>

          {/* Selected Summary */}
          {selectedOptions.size > 0 && (
            <motion.p
              className="text-center text-[13px] text-zinc-500 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {selectedOptions.size === 2
                ? "Setting up baby care and your wellness"
                : selectedOptions.has("baby")
                  ? "Setting up baby care tools"
                  : "Setting up your wellness support"}
            </motion.p>
          )}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="px-6 pb-8 pt-4 bg-zinc-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            onClick={handleSelectionContinue}
            disabled={selectedOptions.size === 0}
            className={`w-full rounded-2xl h-14 text-[16px] font-semibold gap-2 transition-all ${
              selectedOptions.size === 0
                ? "bg-zinc-200 text-zinc-400"
                : "bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white shadow-lg shadow-violet-200/50"
            }`}
            data-testid="button-continue-selection"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen bg-white flex flex-col">
      {/* Dark Charcoal Header */}
      <div className="bg-[#1a1a1a] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" data-testid="link-back-home">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 -ml-2"
              data-testid="button-back-home"
            >
              Back to Explore
            </Button>
          </Link>
          <span className="text-[13px] font-medium bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            Nurture
          </span>
        </div>
      </div>

      {/* Hero Area with Soft Pastel Shapes */}
      <div className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-pink-50/50 to-white">
        {/* Animated Abstract Pastel Shapes */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <motion.div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-violet-100/60 blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-pink-100/70 blur-2xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.9, 0.7] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute top-32 right-16 w-24 h-24 rounded-full bg-amber-100/50 blur-xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative flex flex-col items-center pt-10 pb-14 px-6">
          {/* Dual Icon - Mother & Baby */}
          <motion.div
            className="relative mb-8"
            data-testid="icon-welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Symmetrical Icon Arrangement */}
            <div className="relative flex items-center justify-center">
              {/* Left decorative star */}
              <motion.div
                className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-amber-100/50"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </motion.div>

              {/* Parent Icon */}
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-pink-100/50 border border-pink-100/50">
                  <div className="w-[60px] h-[60px] bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-pink-500" />
                  </div>
                </div>
              </motion.div>

              {/* Central Heart Connection */}
              <motion.div
                className="relative z-20 w-12 h-12 bg-gradient-to-br from-pink-400 to-violet-500 rounded-full flex items-center justify-center shadow-lg -mx-3"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-6 h-6 text-white fill-white" />
              </motion.div>

              {/* Baby Icon */}
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-violet-100/50 border border-violet-100/50">
                  <div className="w-[60px] h-[60px] bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <Baby className="w-7 h-7 text-violet-500" />
                  </div>
                </div>
              </motion.div>

              {/* Right decorative star */}
              <motion.div
                className="absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-violet-100/50"
                animate={{ scale: [1, 1.1, 1], rotate: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                <Star className="w-4 h-4 text-violet-400 fill-violet-400" />
              </motion.div>
            </div>

            {/* Bottom Sparkle */}
            <motion.div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md border border-amber-100/50"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Sparkles className="w-4.5 h-4.5 text-amber-400" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-[26px] font-bold text-zinc-900 text-center mb-3 leading-tight"
            data-testid="text-welcome-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              Nurture
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-[15px] text-zinc-600 text-center max-w-[320px] leading-relaxed mb-3"
            data-testid="text-welcome-subtitle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Everything you need for the first 24 months — vaccines, sleep,
            caregiver wellness, and AI guidance.
          </motion.p>

          {/* Trust Line */}
          <motion.p
            className="text-[13px] text-zinc-400 text-center mb-6 flex items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            data-testid="text-trust-line"
          >
            <Users className="w-3.5 h-3.5" />
            Designed with pediatricians and new mothers.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 max-w-[340px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center gap-1.5 bg-pink-50 text-pink-700 px-3.5 py-2 rounded-full text-[12px] font-medium border border-pink-100/80 shadow-sm">
              <Heart className="w-3.5 h-3.5" />
              Caregiver wellness
            </div>
            <div className="flex items-center gap-1.5 bg-violet-50 text-violet-700 px-3.5 py-2 rounded-full text-[12px] font-medium border border-violet-100/80 shadow-sm">
              <Stethoscope className="w-3.5 h-3.5" />
              Vaccine tracking
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3.5 py-2 rounded-full text-[12px] font-medium border border-indigo-100/80 shadow-sm">
              <Moon className="w-3.5 h-3.5" />
              Sleep support
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3.5 py-2 rounded-full text-[12px] font-medium border border-rose-100/80 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              AI
            </div>
          </motion.div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 bg-white" />

      {/* Bottom CTA Area */}
      <motion.div
        className="px-6 pb-8 pt-4 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white rounded-2xl h-14 text-[16px] font-semibold shadow-lg shadow-violet-200/50 gap-2"
          data-testid="button-setup-babycare"
        >
          Start your journey
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Login Option */}
        <button
          onClick={handleHospitalOption}
          className="w-full mt-4 flex items-center justify-center gap-2 text-[14px] text-violet-600 hover:text-violet-700 transition-colors py-2 font-medium"
          data-testid="button-hospital-registration"
        >
          Already registered? Log in
        </button>
      </motion.div>

      {/* Hospital Registration Options Dialog */}
      <Dialog open={showHospitalDialog} onOpenChange={setShowHospitalDialog}>
        <DialogContent
          className="max-w-[340px] rounded-2xl"
          data-testid="dialog-hospital-options"
        >
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-center">
              Hospital Registration
            </DialogTitle>
            <DialogDescription className="text-[14px] text-zinc-500 text-center mt-2">
              If you were registered at a partner hospital, you can quickly set
              up your baby's profile.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <Button
                onClick={handleScanCode}
                variant="outline"
                className="w-full h-14 rounded-xl border-2 border-violet-200 hover:border-violet-300 hover:bg-violet-50 flex items-center justify-center gap-3"
                data-testid="button-scan-code"
              >
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-violet-600" />
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-semibold text-zinc-900">
                    Scan QR Code
                  </p>
                  <p className="text-[12px] text-zinc-500">
                    Use camera to scan
                  </p>
                </div>
              </Button>

              <Button
                onClick={handleEnterCode}
                variant="outline"
                className="w-full h-14 rounded-xl border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 flex items-center justify-center gap-3"
                data-testid="button-enter-code"
              >
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-zinc-600" />
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-semibold text-zinc-900">
                    Enter Code Manually
                  </p>
                  <p className="text-[12px] text-zinc-500">
                    Type registration code
                  </p>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Code Entry Dialog */}
      <Dialog
        open={showCodeEntry}
        onOpenChange={(open) => {
          setShowCodeEntry(open);
          setCodeError("");
          setRegistrationCode("");
        }}
      >
        <DialogContent
          className="max-w-[340px] rounded-2xl"
          data-testid="dialog-code-entry"
        >
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-center">
              Enter Registration Code
            </DialogTitle>
            <DialogDescription className="text-[14px] text-zinc-500 text-center mt-2">
              Enter the registration code provided by your hospital during
              admission.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="regCode" className="text-[13px] font-medium">
                  Registration Code
                </Label>
                <Input
                  id="regCode"
                  placeholder="e.g., APOLLO2024"
                  value={registrationCode}
                  onChange={(e) => {
                    setRegistrationCode(e.target.value);
                    setCodeError("");
                  }}
                  className="mt-1 rounded-xl h-12 text-center text-[16px] font-mono uppercase tracking-wider"
                  data-testid="input-registration-code"
                />
                {codeError && (
                  <p
                    className="text-[12px] text-red-500 mt-2 text-center"
                    data-testid="text-code-error"
                  >
                    {codeError}
                  </p>
                )}
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={!registrationCode.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl h-12"
                data-testid="button-verify-code"
              >
                Verify & Continue
              </Button>

              <p className="text-[12px] text-zinc-400 text-center">
                Demo codes: APOLLO2024, FORTIS2024, MAX2024
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog
        open={showScanner}
        onOpenChange={(open) => {
          setShowScanner(open);
          setScanStatus("idle");
        }}
      >
        <DialogContent
          className="max-w-[340px] rounded-2xl"
          data-testid="dialog-qr-scanner"
        >
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-center">
              Scan Hospital QR Code
            </DialogTitle>
            <DialogDescription className="sr-only">
              Use your camera to scan the QR code from your hospital
              registration
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden mb-4">
              {/* Scanner viewfinder */}
              <div className="absolute inset-0 flex items-center justify-center">
                {scanStatus === "scanning" && (
                  <div className="relative">
                    {/* Scan frame */}
                    <div className="w-48 h-48 border-2 border-white/50 rounded-xl relative">
                      {/* Corner accents */}
                      <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-violet-400 rounded-tl-lg" />
                      <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-violet-400 rounded-tr-lg" />
                      <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-violet-400 rounded-bl-lg" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-violet-400 rounded-br-lg" />
                      {/* Scanning line animation */}
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent animate-pulse top-1/2" />
                    </div>
                  </div>
                )}
                {scanStatus === "found" && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-white text-[14px] font-medium">
                      Code Found!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              {scanStatus === "scanning" && (
                <div className="flex items-center justify-center gap-2 text-zinc-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-[14px]">Scanning for QR code...</p>
                </div>
              )}
              {scanStatus === "found" && (
                <p
                  className="text-[14px] text-emerald-600 font-medium"
                  data-testid="text-scan-success"
                >
                  Redirecting to profile setup...
                </p>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setShowScanner(false);
                setShowCodeEntry(true);
                setScanStatus("idle");
              }}
              className="w-full mt-4 rounded-xl"
              data-testid="button-enter-manually"
            >
              Enter code manually instead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
