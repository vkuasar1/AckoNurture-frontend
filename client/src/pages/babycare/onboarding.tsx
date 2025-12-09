import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Baby,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Star,
  Frown,
  User,
  HandHeart,
  Leaf,
  Building2,
  Calendar,
  Heart,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  onboardParentAndBaby,
  createProfile,
  type Profile,
} from "@/lib/profileApi";
import { getUserId } from "@/lib/userId";

const formatDateToDisplay = (isoDate: string): string => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
};

const formatDisplayToIso = (displayDate: string): string => {
  if (!displayDate) return "";
  const parts = displayDate.replace(/[^\d/]/g, "").split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  if (!day || !month || !year || year.length !== 4) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const isValidDisplayDate = (displayDate: string): boolean => {
  const isoDate = formatDisplayToIso(displayDate);
  if (!isoDate) return false;
  const date = new Date(isoDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return !isNaN(date.getTime()) && date <= today;
};

type OnboardingStep = 1 | 2 | 3 | 4;

interface OnboardingData {
  caregiverRole: "mother" | "father" | "";
  caregiverName: string;
  babyName: string;
  babyDob: string;
  babyGender: "boy" | "girl" | "";
  deliveryType: "normal" | "csection" | "planned" | "";
  feedingType: "breastfeeding" | "formula" | "combo" | "";
  currentMood: "good" | "okay" | "not_good" | "";
  helpPreferences: string[];
  hospitalName: string;
  communityOptIn: boolean;
}

export default function BabyCareOnboarding() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHospitalFlow, setIsHospitalFlow] = useState(false);
  const [dobDisplay, setDobDisplay] = useState("");
  const [data, setData] = useState<OnboardingData>({
    caregiverRole: "",
    caregiverName: "",
    babyName: "",
    babyDob: "",
    babyGender: "",
    deliveryType: "",
    feedingType: "",
    currentMood: "",
    helpPreferences: [],
    hospitalName: "",
    communityOptIn: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const babyName = params.get("babyName");
    const dob = params.get("dob");
    const gender = params.get("gender");
    const hospital = params.get("hospital");
    const caregiverName = params.get("caregiverName");
    const caregiverRole = params.get("caregiverRole");
    const onboardingType = params.get("onboardingType");

    if (onboardingType === "hospital" && babyName && dob && gender) {
      setIsHospitalFlow(true);
      setDobDisplay(formatDateToDisplay(dob));
      setData((prev) => ({
        ...prev,
        babyName: babyName,
        babyDob: dob,
        babyGender: gender as "boy" | "girl",
        hospitalName: hospital || "",
        caregiverName: caregiverName || "",
        caregiverRole: (caregiverRole as "mother" | "father") || "",
      }));
    } else {
      // Prefill with date 3 months before today
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const prefillIso = threeMonthsAgo.toISOString().split("T")[0];
      setDobDisplay(formatDateToDisplay(prefillIso));
      setData((prev) => ({ ...prev, babyDob: prefillIso }));
    }
  }, [searchString]);

  const userId = getUserId();

  const onboardParentAndBabyMutation = useMutation({
    mutationFn: async (onboardingData: {
      parentName: string;
      parentType: "mother" | "father";
      babyName: string;
      babyDob: string;
      babyGender: "M" | "F";
      hospitalName?: string;
    }) => {
      // Use onboardParentAndBaby to create both parent and baby profiles
      return await onboardParentAndBaby({
        parentName: onboardingData.parentName,
        parentType: onboardingData.parentType,
        babyName: onboardingData.babyName,
        babyDob: onboardingData.babyDob,
        babyGender: onboardingData.babyGender,
        hospitalName: onboardingData.hospitalName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/v1/profiles/user/${userId}`],
      });
    },
  });

  const createUserPreferences = useMutation({
    mutationFn: async (prefsData: {
      babyId: string;
      helpPreferences: string[];
      city?: string;
      areaPincode?: string;
    }) => {
      const res = await apiRequest("POST", "/api/user-preferences", prefsData);
      return res.json();
    },
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep((currentStep + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setError(null);
      setCurrentStep((currentStep - 1) as OnboardingStep);
    }
  };

  const handleRetry = () => {
    setError(null);
    setCurrentStep(3);
  };

  const handleComplete = async () => {
    if (!canProceed()) return;

    setError(null);
    setIsSubmitting(true);
    setCurrentStep(4);

    try {
      if (!data.caregiverRole || !data.caregiverName.trim()) {
        throw new Error("Please complete your information");
      }
      if (!data.babyName.trim() || !data.babyDob || !data.babyGender) {
        throw new Error("Please complete baby information");
      }

      // Map gender from "boy"/"girl" to "M"/"F" for API
      const babyGender = data.babyGender === "boy" ? "M" : "F";

      // Use onboardParentAndBaby to create both parent and baby profiles
      const result = await onboardParentAndBabyMutation.mutateAsync({
        parentName: data.caregiverName.trim(),
        parentType: data.caregiverRole as "mother" | "father",
        babyName: data.babyName.trim(),
        babyDob: data.babyDob,
        babyGender: babyGender,
        hospitalName: data.hospitalName || undefined,
      });

      const babyId = result.baby.profileId || result.baby.id;

      await createUserPreferences.mutateAsync({
        babyId: babyId,
        helpPreferences: [],
      });

      setTimeout(() => {
        setLocation(`/babycare/home/${babyId}`);
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.caregiverRole && data.caregiverName.trim();
      case 2:
        return data.babyName.trim() && data.babyDob && data.babyGender;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const caregiverGreeting = data.caregiverName
    ? `, ${data.caregiverName.split(" ")[0]}`
    : "";

  return (
    <div className="app-container min-h-screen bg-gradient-to-b from-violet-50 via-pink-50/30 to-white flex flex-col">
      <div className="bg-[#1a1a1a] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          {currentStep < 4 ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={
                currentStep === 1 ? () => setLocation("/babycare") : handleBack
              }
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-9 w-9"
              data-testid="button-back-step"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-9" />
          )}
          <span className="text-[13px] font-medium bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            Nurture
          </span>
          <div className="w-9" />
        </div>
      </div>

      {currentStep < 4 && (
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  step <= currentStep
                    ? "bg-gradient-to-r from-pink-400 to-violet-500"
                    : "bg-zinc-200"
                }`}
              />
            ))}
          </div>
          <p className="text-[12px] text-zinc-400 mt-2 text-center">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      )}

      <div className="flex-1 px-6 pt-6 pb-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Who is setting this up */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-100/50">
                  <HandHeart className="w-8 h-8 text-pink-500" />
                </div>
                <h1 className="text-[24px] font-bold text-zinc-900 mb-2">
                  Welcome to your safe space
                </h1>
                <p className="text-[14px] text-zinc-500 leading-relaxed">
                  Let's get to know you so we can personalize your experience
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-[13px] font-medium text-zinc-700 mb-3 block">
                    Who is setting this up?
                  </Label>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          caregiverRole: "mother",
                        }))
                      }
                      className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                        data.caregiverRole === "mother"
                          ? "border-pink-400 bg-pink-50 text-pink-700"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-pink-200"
                      }`}
                      data-testid="button-role-mother"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            data.caregiverRole === "mother"
                              ? "bg-pink-100"
                              : "bg-zinc-100"
                          }`}
                        >
                          <User
                            className={`w-6 h-6 ${data.caregiverRole === "mother" ? "text-pink-600" : "text-zinc-500"}`}
                          />
                        </div>
                        <span className="text-[14px] font-medium">Mother</span>
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          caregiverRole: "father",
                        }))
                      }
                      className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                        data.caregiverRole === "father"
                          ? "border-violet-400 bg-violet-50 text-violet-700"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-violet-200"
                      }`}
                      data-testid="button-role-father"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            data.caregiverRole === "father"
                              ? "bg-violet-100"
                              : "bg-zinc-100"
                          }`}
                        >
                          <User
                            className={`w-6 h-6 ${data.caregiverRole === "father" ? "text-violet-600" : "text-zinc-500"}`}
                          />
                        </div>
                        <span className="text-[14px] font-medium">Father</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="caregiverName"
                    className="text-[13px] font-medium text-zinc-700 mb-2 block"
                  >
                    Your name
                  </Label>
                  <Input
                    id="caregiverName"
                    value={data.caregiverName}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        caregiverName: e.target.value,
                      }))
                    }
                    placeholder="Enter your name"
                    className="h-12 rounded-xl border-zinc-200 focus:border-violet-400 focus:ring-violet-400"
                    data-testid="input-caregiver-name"
                  />
                </div>

                {/* Visual cue - trust message */}
                <motion.div
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl border border-violet-100/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Leaf className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-[13px] text-zinc-600 leading-snug flex-1">
                    Everything you share helps us create a calmer, more
                    supportive experience for you.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Baby Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-100/50">
                  <Baby className="w-8 h-8 text-violet-500" />
                </div>
                <h1 className="text-[24px] font-bold text-zinc-900 mb-2">
                  {isHospitalFlow
                    ? "Confirm baby's details"
                    : `Tell us about your little one${caregiverGreeting}`}
                </h1>
                <p className="text-[14px] text-zinc-500">
                  {isHospitalFlow
                    ? "We've prefilled the details from your hospital registration"
                    : "We'll personalize everything just for you"}
                </p>
                {isHospitalFlow && data.hospitalName && (
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[12px] font-medium border border-emerald-100">
                      <Building2 className="w-3.5 h-3.5" />
                      {data.hospitalName}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <Label
                    htmlFor="babyName"
                    className="text-[13px] font-medium text-zinc-700 mb-2 block"
                  >
                    Baby's name
                  </Label>
                  <Input
                    id="babyName"
                    value={data.babyName}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, babyName: e.target.value }))
                    }
                    placeholder="Enter baby's name"
                    className="h-12 rounded-xl border-zinc-200 focus:border-violet-400 focus:ring-violet-400"
                    data-testid="input-baby-name"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="babyDob"
                    className="text-[13px] font-medium text-zinc-700 mb-2 block"
                  >
                    Date of birth
                  </Label>
                  <div className="relative">
                    <Input
                      id="babyDob"
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={dobDisplay}
                      onChange={(e) => {
                        const value = e.target.value;
                        let formatted = value.replace(/[^\d/]/g, "");
                        const digits = formatted.replace(/\//g, "");
                        if (digits.length <= 2) {
                          formatted = digits;
                        } else if (digits.length <= 4) {
                          formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                        } else {
                          formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
                        }
                        setDobDisplay(formatted);
                        const isoDate = formatDisplayToIso(formatted);
                        if (isoDate && isValidDisplayDate(formatted)) {
                          setData((prev) => ({ ...prev, babyDob: isoDate }));
                        } else {
                          setData((prev) => ({ ...prev, babyDob: "" }));
                        }
                      }}
                      maxLength={10}
                      className="h-12 rounded-xl border-zinc-200 focus:border-violet-400 focus:ring-violet-400 pr-10"
                      data-testid="input-baby-dob"
                    />
                    <input
                      type="date"
                      id="babyDobPicker"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      max={new Date().toISOString().split("T")[0]}
                      value={data.babyDob}
                      onChange={(e) => {
                        const isoDate = e.target.value;
                        if (isoDate) {
                          setData((prev) => ({ ...prev, babyDob: isoDate }));
                          setDobDisplay(formatDateToDisplay(isoDate));
                        }
                      }}
                      data-testid="input-baby-dob-picker"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <Label className="text-[13px] font-medium text-zinc-700 mb-3 block">
                    Gender
                  </Label>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setData((prev) => ({ ...prev, babyGender: "boy" }))
                      }
                      className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                        data.babyGender === "boy"
                          ? "border-violet-400 bg-violet-50 text-violet-700"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-violet-200"
                      }`}
                      data-testid="button-gender-boy"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            data.babyGender === "boy"
                              ? "bg-violet-100"
                              : "bg-zinc-100"
                          }`}
                        >
                          <Baby
                            className={`w-5 h-5 ${data.babyGender === "boy" ? "text-violet-600" : "text-zinc-500"}`}
                          />
                        </div>
                        <span className="text-[13px] font-medium">Boy</span>
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        setData((prev) => ({ ...prev, babyGender: "girl" }))
                      }
                      className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                        data.babyGender === "girl"
                          ? "border-pink-400 bg-pink-50 text-pink-700"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-pink-200"
                      }`}
                      data-testid="button-gender-girl"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            data.babyGender === "girl"
                              ? "bg-pink-100"
                              : "bg-zinc-100"
                          }`}
                        >
                          <Baby
                            className={`w-5 h-5 ${data.babyGender === "girl" ? "text-pink-600" : "text-zinc-500"}`}
                          />
                        </div>
                        <span className="text-[13px] font-medium">Girl</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Help Preferences */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-100/50">
                  <Heart className="w-8 h-8 text-pink-500" />
                </div>
                <h1 className="text-[24px] font-bold text-zinc-900 mb-2">
                  Help other parents like you{caregiverGreeting}
                </h1>
                <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[280px] mx-auto">
                  You can guide them well if they need help
                </p>
              </div>

              <motion.div
                className="p-5 bg-gradient-to-r from-pink-50 to-violet-50 rounded-xl border border-pink-100/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-[14px] font-medium text-zinc-800 block mb-1">
                      Join the parent community
                    </span>
                    <p className="text-[12px] text-zinc-500 leading-relaxed">
                      Share your journey to support parents facing similar
                      challenges. Your privacy is protected.
                    </p>
                  </div>
                  <Switch
                    checked={data.communityOptIn}
                    onCheckedChange={(checked) =>
                      setData((prev) => ({ ...prev, communityOptIn: checked }))
                    }
                    data-testid="switch-community-optin"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 4: Loader */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              {error ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center px-6"
                >
                  <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Frown className="w-10 h-10 text-rose-500" />
                  </div>
                  <h1 className="text-[22px] font-bold text-zinc-900 mb-2">
                    Something went wrong
                  </h1>
                  <p className="text-[14px] text-zinc-500 mb-6 max-w-[280px] mx-auto">
                    {error}
                  </p>
                  <Button
                    onClick={handleRetry}
                    className="bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-xl h-12 px-8"
                    data-testid="button-retry"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go back and try again
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="relative mb-8">
                    <motion.div
                      className="w-24 h-24 bg-gradient-to-br from-pink-400 to-violet-500 rounded-full flex items-center justify-center mx-auto shadow-xl"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-12 h-12 text-white" />
                    </motion.div>
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Star className="w-4 h-4 text-white fill-white" />
                    </motion.div>
                  </div>

                  <h1 className="text-[24px] font-bold text-zinc-900 mb-3">
                    Creating your safe space{caregiverGreeting}
                  </h1>
                  <p className="text-[14px] text-zinc-500 mb-8 max-w-[280px] mx-auto">
                    Setting up personalized care for{" "}
                    {data.babyName || "your little one"}...
                  </p>

                  <div className="flex items-center justify-center gap-2 text-violet-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-[13px] font-medium">
                      Almost ready
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {currentStep < 4 && (
        <div className="px-6 pb-8 pt-4 bg-gradient-to-t from-white to-transparent">
          <Button
            onClick={currentStep === 3 ? handleComplete : handleNext}
            disabled={!canProceed()}
            className={`w-full rounded-2xl h-14 text-[16px] font-semibold gap-2 transition-all ${
              canProceed()
                ? "bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white shadow-lg shadow-violet-200/50"
                : "bg-zinc-200 text-zinc-400"
            }`}
            data-testid="button-next-step"
          >
            {currentStep === 3 ? "Complete Setup" : "Continue"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
