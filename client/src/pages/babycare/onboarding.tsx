import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Baby, Heart, ArrowRight, ArrowLeft, Check, Loader2, 
  MapPin, Sparkles, Syringe, TrendingUp, 
  Star, Moon, Utensils, Briefcase, Users, Smile, Meh, Frown,
  User, HandHeart, Leaf, Building2
} from "lucide-react";
import type { BabyProfile } from "@shared/schema";

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

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
  city: string;
  areaPincode: string;
  hospitalName: string;
}

const HELP_OPTIONS = [
  { id: "vaccination", label: "Vaccination", icon: Syringe },
  { id: "growth", label: "Growth Tracking", icon: TrendingUp },
  { id: "milestones", label: "Milestones", icon: Star },
  { id: "sleep", label: "Sleep Support", icon: Moon },
  { id: "feeding", label: "Feeding Help", icon: Utensils },
  { id: "return_to_work", label: "Return to Work", icon: Briefcase },
  { id: "nanny", label: "Find a Nanny", icon: Users },
];

const MOOD_OPTIONS = [
  { 
    id: "good", 
    label: "Doing great!", 
    icon: Smile, 
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-400",
    supportMessage: "That's wonderful! We're here to keep that positive energy going."
  },
  { 
    id: "okay", 
    label: "Hanging in there", 
    icon: Meh, 
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
    supportMessage: "You're doing amazing. We're right here with you, every step of the way."
  },
  { 
    id: "not_good", 
    label: "Could use support", 
    icon: Frown, 
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-400",
    supportMessage: "We see you. You're not alone in this journey. Let us help lighten your load."
  },
];

export default function BabyCareOnboarding() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHospitalFlow, setIsHospitalFlow] = useState(false);
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
    city: "",
    areaPincode: "",
    hospitalName: "",
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
      setData(prev => ({
        ...prev,
        babyName: babyName,
        babyDob: dob,
        babyGender: gender as "boy" | "girl",
        hospitalName: hospital || "",
        caregiverName: caregiverName || "",
        caregiverRole: (caregiverRole as "mother" | "father") || "",
      }));
    }
  }, [searchString]);

  const createBabyProfile = useMutation({
    mutationFn: async (profileData: { name: string; dob: string; gender: string }) => {
      const res = await apiRequest("POST", "/api/baby-profiles", profileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/baby-profiles"] });
    },
  });

  const createMotherProfile = useMutation({
    mutationFn: async (profileData: { babyId: string; deliveryType: string; feedingType: string; currentMood?: string }) => {
      const res = await apiRequest("POST", "/api/mother-profiles", profileData);
      return res.json();
    },
  });

  const createUserPreferences = useMutation({
    mutationFn: async (prefsData: { babyId: string; helpPreferences: string[]; city?: string; areaPincode?: string }) => {
      const res = await apiRequest("POST", "/api/user-preferences", prefsData);
      return res.json();
    },
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < 6 && canProceed()) {
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
    setCurrentStep(5);
  };

  const handleComplete = async () => {
    if (!canProceed()) return;
    
    setError(null);
    setIsSubmitting(true);
    setCurrentStep(6);
    
    try {
      if (!data.caregiverRole || !data.caregiverName.trim()) {
        throw new Error("Please complete your information");
      }
      if (!data.babyName.trim() || !data.babyDob || !data.babyGender) {
        throw new Error("Please complete baby information");
      }
      if (!data.deliveryType || !data.feedingType) {
        throw new Error("Please complete your wellness information");
      }
      if (data.helpPreferences.length === 0) {
        throw new Error("Please select at least one help preference");
      }

      const babyProfile: BabyProfile = await createBabyProfile.mutateAsync({
        name: data.babyName.trim(),
        dob: data.babyDob,
        gender: data.babyGender,
      });

      await createMotherProfile.mutateAsync({
        babyId: babyProfile.id,
        deliveryType: data.deliveryType,
        feedingType: data.feedingType,
        currentMood: data.currentMood || undefined,
      });

      await createUserPreferences.mutateAsync({
        babyId: babyProfile.id,
        helpPreferences: data.helpPreferences,
        city: data.city.trim() || undefined,
        areaPincode: data.areaPincode.trim() || undefined,
      });

      setTimeout(() => {
        setLocation(`/babycare/home/${babyProfile.id}`);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const toggleHelpPreference = (id: string) => {
    setData(prev => ({
      ...prev,
      helpPreferences: prev.helpPreferences.includes(id)
        ? prev.helpPreferences.filter(p => p !== id)
        : [...prev.helpPreferences, id],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.caregiverRole && data.caregiverName.trim();
      case 2:
        return data.babyName.trim() && data.babyDob && data.babyGender;
      case 3:
        return data.deliveryType && data.feedingType;
      case 4:
        return data.helpPreferences.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const getMoodSupportMessage = () => {
    const mood = MOOD_OPTIONS.find(m => m.id === data.currentMood);
    return mood?.supportMessage || null;
  };

  const getMoodOption = () => {
    return MOOD_OPTIONS.find(m => m.id === data.currentMood);
  };

  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const caregiverGreeting = data.caregiverName ? `, ${data.caregiverName.split(' ')[0]}` : "";

  return (
    <div className="app-container min-h-screen bg-gradient-to-b from-violet-50 via-pink-50/30 to-white flex flex-col">
      <div className="bg-[#1a1a1a] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          {currentStep < 6 ? (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={currentStep === 1 ? () => setLocation("/babycare") : handleBack}
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

      {currentStep < 6 && (
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
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
                      onClick={() => setData(prev => ({ ...prev, caregiverRole: "mother" }))}
                      className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                        data.caregiverRole === "mother"
                          ? "border-pink-400 bg-pink-50 text-pink-700"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-pink-200"
                      }`}
                      data-testid="button-role-mother"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          data.caregiverRole === "mother" ? "bg-pink-100" : "bg-zinc-100"
                        }`}>
                          <User className={`w-6 h-6 ${data.caregiverRole === "mother" ? "text-pink-600" : "text-zinc-500"}`} />
                        </div>
                        <span className="text-[14px] font-medium">Mother</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setData(prev => ({ ...prev, caregiverRole: "father" }))}
                      className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                        data.caregiverRole === "father"
                          ? "border-violet-400 bg-violet-50 text-violet-700"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-violet-200"
                      }`}
                      data-testid="button-role-father"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          data.caregiverRole === "father" ? "bg-violet-100" : "bg-zinc-100"
                        }`}>
                          <User className={`w-6 h-6 ${data.caregiverRole === "father" ? "text-violet-600" : "text-zinc-500"}`} />
                        </div>
                        <span className="text-[14px] font-medium">Father</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="caregiverName" className="text-[13px] font-medium text-zinc-700 mb-2 block">
                    Your name
                  </Label>
                  <Input
                    id="caregiverName"
                    value={data.caregiverName}
                    onChange={(e) => setData(prev => ({ ...prev, caregiverName: e.target.value }))}
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
                    Everything you share helps us create a calmer, more supportive experience for you.
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
                  {isHospitalFlow ? "Confirm baby's details" : `Tell us about your little one${caregiverGreeting}`}
                </h1>
                <p className="text-[14px] text-zinc-500">
                  {isHospitalFlow ? "We've prefilled the details from your hospital registration" : "We'll personalize everything just for you"}
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
                  <Label htmlFor="babyName" className="text-[13px] font-medium text-zinc-700 mb-2 block">
                    Baby's name
                  </Label>
                  <Input
                    id="babyName"
                    value={data.babyName}
                    onChange={(e) => setData(prev => ({ ...prev, babyName: e.target.value }))}
                    placeholder="Enter baby's name"
                    className="h-12 rounded-xl border-zinc-200 focus:border-violet-400 focus:ring-violet-400"
                    data-testid="input-baby-name"
                  />
                </div>

                <div>
                  <Label htmlFor="babyDob" className="text-[13px] font-medium text-zinc-700 mb-2 block">
                    Date of birth
                  </Label>
                  <Input
                    id="babyDob"
                    type="date"
                    value={data.babyDob}
                    onChange={(e) => setData(prev => ({ ...prev, babyDob: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-12 rounded-xl border-zinc-200 focus:border-violet-400 focus:ring-violet-400"
                    data-testid="input-baby-dob"
                  />
                </div>

                <div>
                  <Label className="text-[13px] font-medium text-zinc-700 mb-3 block">
                    Gender
                  </Label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setData(prev => ({ ...prev, babyGender: "boy" }))}
                      className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                        data.babyGender === "boy"
                          ? "border-violet-400 bg-violet-50 text-violet-700"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-violet-200"
                      }`}
                      data-testid="button-gender-boy"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          data.babyGender === "boy" ? "bg-violet-100" : "bg-zinc-100"
                        }`}>
                          <Baby className={`w-5 h-5 ${data.babyGender === "boy" ? "text-violet-600" : "text-zinc-500"}`} />
                        </div>
                        <span className="text-[13px] font-medium">Boy</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setData(prev => ({ ...prev, babyGender: "girl" }))}
                      className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                        data.babyGender === "girl"
                          ? "border-pink-400 bg-pink-50 text-pink-700"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-pink-200"
                      }`}
                      data-testid="button-gender-girl"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          data.babyGender === "girl" ? "bg-pink-100" : "bg-zinc-100"
                        }`}>
                          <Baby className={`w-5 h-5 ${data.babyGender === "girl" ? "text-pink-600" : "text-zinc-500"}`} />
                        </div>
                        <span className="text-[13px] font-medium">Girl</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: About You - Wellness */}
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
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-100/50">
                  <Heart className="w-8 h-8 text-pink-500" />
                </div>
                <h1 className="text-[24px] font-bold text-zinc-900 mb-2">
                  A little about your journey
                </h1>
                <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[280px] mx-auto">
                  This helps us offer the right support at the right time. No pressure — share only what feels comfortable.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-[13px] font-medium text-zinc-700 mb-3 block">
                    Delivery type
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "normal", label: "Natural" },
                      { id: "csection", label: "C-Section" },
                      { id: "planned", label: "Planned C" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setData(prev => ({ ...prev, deliveryType: option.id as typeof prev.deliveryType }))}
                        className={`py-3 px-2 rounded-xl border-2 text-[13px] font-medium transition-all ${
                          data.deliveryType === option.id
                            ? "border-pink-400 bg-pink-50 text-pink-700"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-pink-200"
                        }`}
                        data-testid={`button-delivery-${option.id}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-[13px] font-medium text-zinc-700 mb-3 block">
                    Feeding approach
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "breastfeeding", label: "Breastfeed" },
                      { id: "formula", label: "Formula" },
                      { id: "combo", label: "Combo" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setData(prev => ({ ...prev, feedingType: option.id as typeof prev.feedingType }))}
                        className={`py-3 px-2 rounded-xl border-2 text-[13px] font-medium transition-all ${
                          data.feedingType === option.id
                            ? "border-violet-400 bg-violet-50 text-violet-700"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-violet-200"
                        }`}
                        data-testid={`button-feeding-${option.id}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-[13px] font-medium text-zinc-700 mb-3 block">
                    How are you feeling today?
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {MOOD_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isSelected = data.currentMood === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setData(prev => ({ ...prev, currentMood: option.id as typeof prev.currentMood }))}
                          className={`py-4 px-2 rounded-xl border-2 transition-all ${
                            isSelected
                              ? `${option.borderColor} ${option.bgColor}`
                              : "border-zinc-200 bg-white hover:border-zinc-300"
                          }`}
                          data-testid={`button-mood-${option.id}`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icon className={`w-6 h-6 ${option.color}`} />
                            <span className={`text-[11px] font-medium leading-tight text-center ${
                              isSelected ? "text-zinc-700" : "text-zinc-600"
                            }`}>
                              {option.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Supportive mood pill */}
                  <AnimatePresence>
                    {data.currentMood && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <div className={`flex items-center gap-3 p-4 rounded-xl ${getMoodOption()?.bgColor} border ${getMoodOption()?.borderColor?.replace('border-', 'border-')}/30`}>
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                            <Heart className={`w-4 h-4 ${getMoodOption()?.color}`} />
                          </div>
                          <p className="text-[13px] text-zinc-700 leading-snug">
                            {getMoodSupportMessage()}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Help Preferences */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-100/50">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-[24px] font-bold text-zinc-900 mb-2">
                  How can we help you{caregiverGreeting}?
                </h1>
                <p className="text-[14px] text-zinc-500">
                  Select all that apply — we'll prioritize these for you
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {HELP_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = data.helpPreferences.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleHelpPreference(option.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-violet-400 bg-violet-50"
                          : "border-zinc-200 bg-white hover:border-violet-200"
                      }`}
                      data-testid={`button-help-${option.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-violet-100" : "bg-zinc-100"
                        }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? "text-violet-600" : "text-zinc-500"}`} />
                        </div>
                        <span className={`text-[13px] font-medium flex-1 ${
                          isSelected ? "text-violet-700" : "text-zinc-700"
                        }`}>
                          {option.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 5: Location */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100/50">
                  <MapPin className="w-8 h-8 text-indigo-500" />
                </div>
                <h1 className="text-[24px] font-bold text-zinc-900 mb-2">
                  Almost there{caregiverGreeting}!
                </h1>
                <p className="text-[14px] text-zinc-500">
                  Optional — helps us find local resources for you
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="city" className="text-[13px] font-medium text-zinc-700 mb-2 block">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={data.city}
                    onChange={(e) => setData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                    className="h-12 rounded-xl border-zinc-200 focus:border-indigo-400 focus:ring-indigo-400"
                    data-testid="input-city"
                  />
                </div>

                <div>
                  <Label htmlFor="areaPincode" className="text-[13px] font-medium text-zinc-700 mb-2 block">
                    Area / Pincode
                  </Label>
                  <Input
                    id="areaPincode"
                    value={data.areaPincode}
                    onChange={(e) => setData(prev => ({ ...prev, areaPincode: e.target.value }))}
                    placeholder="e.g., Bandra West, 400050"
                    className="h-12 rounded-xl border-zinc-200 focus:border-indigo-400 focus:ring-indigo-400"
                    data-testid="input-area-pincode"
                  />
                </div>
              </div>

              <p className="text-center text-[12px] text-zinc-400 mt-6">
                You can skip this step and add location later
              </p>
            </motion.div>
          )}

          {/* Step 6: Loader */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
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
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Star className="w-4 h-4 text-white fill-white" />
                    </motion.div>
                  </div>

                  <h1 className="text-[24px] font-bold text-zinc-900 mb-3">
                    Creating your safe space{caregiverGreeting}
                  </h1>
                  <p className="text-[14px] text-zinc-500 mb-8 max-w-[280px] mx-auto">
                    Setting up personalized care for {data.babyName || "your little one"}...
                  </p>

                  <div className="flex items-center justify-center gap-2 text-violet-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-[13px] font-medium">Almost ready</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {currentStep < 6 && (
        <div className="px-6 pb-8 pt-4 bg-gradient-to-t from-white to-transparent">
          <Button 
            onClick={currentStep === 5 ? handleComplete : handleNext}
            disabled={!canProceed()}
            className={`w-full rounded-2xl h-14 text-[16px] font-semibold gap-2 transition-all ${
              canProceed()
                ? "bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white shadow-lg shadow-violet-200/50"
                : "bg-zinc-200 text-zinc-400"
            }`}
            data-testid="button-next-step"
          >
            {currentStep === 5 ? "Complete Setup" : "Continue"}
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          {currentStep === 5 && (
            <Button
              variant="ghost"
              onClick={handleComplete}
              className="w-full mt-3 text-zinc-500 hover:text-zinc-700"
              data-testid="button-skip-location"
            >
              Skip for now
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
