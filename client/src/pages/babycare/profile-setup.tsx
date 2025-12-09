import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Loader2,
  User2,
  Building2,
  CheckCircle2,
  Baby,
  Heart,
  Sparkles,
  CalendarDays,
  QrCode,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { BabyProfile } from "@shared/schema";
import { saveCaregiverProfile } from "@/lib/caregiverStore";
import { createProfile, type Profile } from "@/lib/profileApi";
import { getUserId } from "@/lib/userId";

const caregiverFormSchema = z.object({
  caregiverName: z
    .string()
    .min(1, "Your name is required")
    .max(50, "Name too long"),
  relationship: z.enum(["mother", "father", "caregiver"], {
    required_error: "Please select your relationship",
  }),
});

const babyFormSchema = z.object({
  babyName: z
    .string()
    .min(1, "Baby's name is required")
    .max(50, "Name too long"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["boy", "girl"], { required_error: "Please select gender" }),
});

type CaregiverFormValues = z.infer<typeof caregiverFormSchema>;
type BabyFormValues = z.infer<typeof babyFormSchema>;

type Step = 1 | 2 | 3;

export default function BabyCareProfileSetup() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();

  // Parse params early to determine initial step
  const initialParams = new URLSearchParams(searchString);
  const initialIncludeBaby = initialParams.get("includeBaby") === "true";
  const initialIncludeMother = initialParams.get("includeMother") === "true";
  const isHospitalOnboardingInitial =
    initialParams.get("onboardingType") === "hospital";
  // Baby-only mode: start at step 2 (baby form), skip caregiver form
  const babyOnlyMode =
    initialIncludeBaby && !initialIncludeMother && !isHospitalOnboardingInitial;

  const [step, setStep] = useState<Step>(babyOnlyMode ? 2 : 1);
  const [caregiverData, setCaregiverData] =
    useState<CaregiverFormValues | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showHospitalDialog, setShowHospitalDialog] = useState(false);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [scanStatus, setScanStatus] = useState<"scanning" | "found" | "idle">(
    "idle",
  );

  const MOCK_HOSPITAL_CODES: Record<
    string,
    {
      caregiverName: string;
      relationship: "mother" | "father" | "caregiver";
      babyName: string;
      dob: string;
      gender: "boy" | "girl";
      hospitalName: string;
    }
  > = {
    APOLLO2024: {
      caregiverName: "Priya Sharma",
      relationship: "mother",
      babyName: "Baby Sharma",
      dob: "2024-09-15",
      gender: "boy",
      hospitalName: "Apollo Cradle Hospital",
    },
    FORTIS2024: {
      caregiverName: "Rahul Gupta",
      relationship: "father",
      babyName: "Baby Gupta",
      dob: "2024-10-20",
      gender: "girl",
      hospitalName: "Fortis La Femme",
    },
    MAX2024: {
      caregiverName: "Anita Singh",
      relationship: "mother",
      babyName: "Baby Singh",
      dob: "2024-11-05",
      gender: "boy",
      hospitalName: "Max Super Speciality",
    },
  };

  const params = new URLSearchParams(searchString);
  const prefillCaregiverName = params.get("caregiverName") || "";
  const prefillRelationship = params.get("relationship") as
    | "mother"
    | "father"
    | "caregiver"
    | null;
  const prefillBabyName = params.get("babyName") || "";
  const prefillDob = params.get("dob") || "";
  const prefillGender = params.get("gender") as "boy" | "girl" | null;
  const hospitalName = params.get("hospital") || "";
  const onboardingType =
    params.get("onboardingType") === "hospital" ? "hospital" : "d2c";
  const isHospitalOnboarding = onboardingType === "hospital";

  // Onboarding selection params - determines which forms to show
  const includeBaby = params.get("includeBaby") === "true";
  const includeMother = params.get("includeMother") === "true";
  // Default to baby only if neither param is set (backward compatibility)
  const showBabyForm = includeBaby || (!includeBaby && !includeMother);
  const showMotherOnly = includeMother && !includeBaby;

  const caregiverForm = useForm<CaregiverFormValues>({
    resolver: zodResolver(caregiverFormSchema),
    defaultValues: {
      caregiverName: prefillCaregiverName,
      relationship: prefillRelationship || undefined,
    },
  });

  const babyForm = useForm<BabyFormValues>({
    resolver: zodResolver(babyFormSchema),
    defaultValues: {
      babyName: prefillBabyName,
      dob: prefillDob,
      gender: prefillGender || undefined,
    },
  });

  useEffect(() => {
    if (isHospitalOnboarding) {
      // Pre-fill caregiver data
      if (prefillCaregiverName)
        caregiverForm.setValue("caregiverName", prefillCaregiverName);
      if (prefillRelationship)
        caregiverForm.setValue("relationship", prefillRelationship);
      setCaregiverData({
        caregiverName: prefillCaregiverName,
        relationship: prefillRelationship || "mother",
      });

      // Pre-fill baby data
      if (prefillBabyName) babyForm.setValue("babyName", prefillBabyName);
      if (prefillDob) babyForm.setValue("dob", prefillDob);
      if (prefillGender) babyForm.setValue("gender", prefillGender);

      // Go directly to confirmation step
      setStep(3);
    }
  }, [
    isHospitalOnboarding,
    prefillCaregiverName,
    prefillRelationship,
    prefillBabyName,
    prefillDob,
    prefillGender,
    caregiverForm,
    babyForm,
  ]);

  const createBabyProfile = useMutation({
    mutationFn: async (babyData: BabyFormValues) => {
      return await createProfile({
        type: "baby",
        name: babyData.babyName,
        dob: babyData.dob,
        gender: babyData.gender, // createProfile accepts "boy" | "girl"
        imageUrl: photoPreview || undefined,
        onboardingType: onboardingType,
        pincode: undefined,
        metadata:
          isHospitalOnboarding && hospitalName ? { hospitalName } : undefined,
      });
    },
    onSuccess: (profile: Profile) => {
      toast({
        title: "Welcome to Nurture!",
        description: `You're all set!`,
      });
      setLocation(`/babycare/home/${profile.profileId}`);
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCaregiverSubmit = (data: CaregiverFormValues) => {
    setCaregiverData(data);

    // Save caregiver profile to localStorage
    saveCaregiverProfile({
      name: data.caregiverName,
      relationship: data.relationship,
      weeksPostpartum: data.relationship === "mother" ? 8 : undefined, // Default for mothers
      setupCompleted: true,
      setupDate: new Date().toISOString(),
    });

    if (showMotherOnly) {
      // Mother-only flow: skip baby form, go directly to home with mother tab
      toast({
        title: "Welcome to Nurture!",
        description: "Your wellness journey begins now.",
      });
      setLocation("/babycare/home?tab=mother");
    } else {
      setStep(2);
    }
  };

  const handleBabySubmit = (data: BabyFormValues) => {
    if (babyOnlyMode) {
      // Baby-only flow: skip confirmation, create profile directly
      createBabyProfile.mutate(data);
    } else {
      setStep(3);
    }
  };

  const handleComplete = () => {
    const babyData = babyForm.getValues();
    createBabyProfile.mutate(babyData);
  };

  const handleSkip = () => {
    const demoCaregiver = {
      caregiverName: "Parent",
      relationship: "mother" as const,
    };
    setCaregiverData(demoCaregiver);
    const demoBaby = {
      babyName: "Little One",
      dob: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      gender: "boy" as const,
    };
    babyForm.setValue("babyName", demoBaby.babyName);
    babyForm.setValue("dob", demoBaby.dob);
    babyForm.setValue("gender", demoBaby.gender);
    createBabyProfile.mutate(demoBaby);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const relationship = caregiverForm.watch("relationship");

  const getRelationshipLabel = () => {
    switch (caregiverData?.relationship) {
      case "mother":
        return "Mom";
      case "father":
        return "Dad";
      case "caregiver":
        return "Caregiver";
      default:
        return "You";
    }
  };

  const buildHospitalUrl = (data: (typeof MOCK_HOSPITAL_CODES)[string]) => {
    const params = new URLSearchParams({
      caregiverName: data.caregiverName,
      relationship: data.relationship,
      babyName: data.babyName,
      dob: data.dob,
      gender: data.gender,
      hospital: data.hospitalName,
      onboardingType: "hospital",
    });
    return `/babycare/setup?${params.toString()}`;
  };

  const handleCodeSubmit = () => {
    const code = registrationCode.trim().toUpperCase();
    if (!code) {
      setCodeError("Please enter a registration code");
      return;
    }

    const hospitalData = MOCK_HOSPITAL_CODES[code];
    if (hospitalData) {
      setCodeError("");
      setShowCodeEntry(false);
      setShowHospitalDialog(false);
      setLocation(buildHospitalUrl(hospitalData));
    } else {
      setCodeError("Invalid code. Try: APOLLO2024, FORTIS2024, or MAX2024");
    }
  };

  const handleScanQR = () => {
    setShowHospitalDialog(false);
    setShowScanner(true);
    setScanStatus("scanning");

    setTimeout(() => {
      setScanStatus("found");
      const hospitalData = MOCK_HOSPITAL_CODES["APOLLO2024"];

      setTimeout(() => {
        setShowScanner(false);
        setScanStatus("idle");
        setLocation(buildHospitalUrl(hospitalData));
      }, 1000);
    }, 2000);
  };

  const handleOpenCodeEntry = () => {
    setShowHospitalDialog(false);
    setShowCodeEntry(true);
    setCodeError("");
    setRegistrationCode("");
  };

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="app-container min-h-screen bg-white flex flex-col">
      {/* Dark Charcoal Header */}
      <div className="bg-[#1a1a1a] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 && !isHospitalOnboarding && !babyOnlyMode ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep((step - 1) as Step)}
                className="text-white hover:bg-white/10 rounded-full h-10 w-10"
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Link href="/babycare?step=selection">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 rounded-full h-10 w-10"
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <h1 className="text-[18px] font-bold" data-testid="text-title">
              {isHospitalOnboarding ? "Confirm Details" : "Get Started"}
            </h1>
          </div>
          <span className="text-[13px] font-medium bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            Nurture
          </span>
        </div>
      </div>

      {/* Progress Dots */}
      {!isHospitalOnboarding && (
        <div className="flex items-center justify-center gap-2 py-4 bg-zinc-50 border-b border-zinc-100">
          {babyOnlyMode
            ? // Baby-only mode: show 2 dots (baby form → confirmation handled via direct submit)
              [1, 2].map((s) => {
                const actualStep = s === 1 ? 2 : 3; // Map to actual step numbers
                const isCurrent =
                  step === actualStep || (s === 1 && step === 2);
                const isPast = s === 1 && step > 2;
                return (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? "w-8 bg-gradient-to-r from-pink-500 to-violet-500"
                        : isPast
                          ? "w-2 bg-violet-400"
                          : "w-2 bg-zinc-200"
                    }`}
                    data-testid={`progress-dot-${s}`}
                  />
                );
              })
            : // Normal mode: show 3 dots
              [1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? "w-8 bg-gradient-to-r from-pink-500 to-violet-500"
                      : s < step
                        ? "w-2 bg-violet-400"
                        : "w-2 bg-zinc-200"
                  }`}
                  data-testid={`progress-dot-${s}`}
                />
              ))}
        </div>
      )}

      {/* Hospital Context Banner */}
      {isHospitalOnboarding && hospitalName && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p
                  className="text-[13px] font-semibold text-emerald-800"
                  data-testid="text-hospital-name"
                >
                  {hospitalName}
                </p>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[12px] text-emerald-600">
                Details pre-filled from hospital
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-6 pt-6 pb-8 overflow-y-auto bg-white">
        <AnimatePresence mode="wait">
          {/* Step 1: About You */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {/* Step Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-violet-500" />
                </div>
                <h2
                  className="text-[22px] font-bold text-zinc-900 mb-2"
                  data-testid="text-step-title"
                >
                  Who's setting this up?
                </h2>
                <p className="text-[14px] text-zinc-500">
                  Tell us a bit about yourself
                </p>
              </div>

              <Form {...caregiverForm}>
                <form
                  onSubmit={caregiverForm.handleSubmit(handleCaregiverSubmit)}
                  className="space-y-5"
                >
                  {/* Caregiver Name */}
                  <FormField
                    control={caregiverForm.control}
                    name="caregiverName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[14px] font-semibold text-zinc-700">
                          Your name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your name"
                            className="h-14 rounded-2xl border-zinc-200 bg-white text-[16px] px-4 focus:border-violet-400 focus:ring-violet-400"
                            data-testid="input-caregiver-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Relationship Selection */}
                  <FormField
                    control={caregiverForm.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[14px] font-semibold text-zinc-700">
                          I am the baby's...
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => field.onChange("mother")}
                              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                                field.value === "mother"
                                  ? "border-pink-400 bg-pink-50"
                                  : "border-zinc-200 bg-white hover:border-zinc-300"
                              }`}
                              data-testid="button-relationship-mother"
                            >
                              <span className={`text-2xl`}>👩</span>
                              <span
                                className={`text-[13px] font-semibold ${field.value === "mother" ? "text-pink-700" : "text-zinc-600"}`}
                              >
                                Mother
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange("father")}
                              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                                field.value === "father"
                                  ? "border-blue-400 bg-blue-50"
                                  : "border-zinc-200 bg-white hover:border-zinc-300"
                              }`}
                              data-testid="button-relationship-father"
                            >
                              <span className={`text-2xl`}>👨</span>
                              <span
                                className={`text-[13px] font-semibold ${field.value === "father" ? "text-blue-700" : "text-zinc-600"}`}
                              >
                                Father
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange("caregiver")}
                              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                                field.value === "caregiver"
                                  ? "border-violet-400 bg-violet-50"
                                  : "border-zinc-200 bg-white hover:border-zinc-300"
                              }`}
                              data-testid="button-relationship-caregiver"
                            >
                              <span className={`text-2xl`}>👤</span>
                              <span
                                className={`text-[13px] font-semibold ${field.value === "caregiver" ? "text-violet-700" : "text-zinc-600"}`}
                              >
                                Caregiver
                              </span>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mother-specific note */}
                  {relationship === "mother" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-pink-50 rounded-xl p-4 border border-pink-100"
                    >
                      <p className="text-[13px] text-pink-700">
                        <span className="font-semibold">For you too:</span>{" "}
                        We'll also help you track your postpartum recovery with
                        personalized support.
                      </p>
                    </motion.div>
                  )}

                  {/* Continue Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white rounded-2xl h-14 text-[16px] font-semibold shadow-lg shadow-violet-200/50 gap-2"
                      data-testid="button-continue-step1"
                    >
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </Form>

              {/* Hospital Link Option */}
              <button
                onClick={() => setShowHospitalDialog(true)}
                className="w-full mt-5 flex items-center justify-center gap-2 text-[14px] text-violet-600 hover:text-violet-700 transition-colors py-2 font-medium"
                data-testid="button-hospital-registration"
              >
                <Building2 className="w-4 h-4" />
                Have a hospital registration code?
              </button>

              {/* Skip Option */}
              <button
                onClick={handleSkip}
                disabled={createBabyProfile.isPending}
                className="w-full mt-2 text-[14px] text-zinc-400 hover:text-zinc-600 transition-colors py-2"
                data-testid="button-skip"
              >
                {createBabyProfile.isPending
                  ? "Setting up..."
                  : "Explore with sample data"}
              </button>
            </motion.div>
          )}

          {/* Step 2: About Baby */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {/* Step Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Baby className="w-8 h-8 text-violet-500" />
                </div>
                <h2
                  className="text-[22px] font-bold text-zinc-900 mb-2"
                  data-testid="text-step-title"
                >
                  About your little one
                </h2>
                <p className="text-[14px] text-zinc-500">
                  Tell us about your baby
                </p>
              </div>

              {/* Photo Upload */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer"
                    data-testid="label-photo-upload"
                  >
                    <div className="w-24 h-24 rounded-full bg-violet-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Baby"
                          className="w-full h-full object-cover"
                          data-testid="img-photo-preview"
                        />
                      ) : (
                        <User2 className="w-10 h-10 text-violet-400" />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    data-testid="input-photo"
                  />
                </div>
              </div>

              {/* Hospital Prefill Notice */}
              {isHospitalOnboarding && (
                <div className="bg-violet-50 rounded-xl p-3 mb-5 border border-violet-100">
                  <p className="text-[12px] text-violet-700 text-center">
                    Details pre-filled from hospital. Please verify.
                  </p>
                </div>
              )}

              <Form {...babyForm}>
                <form
                  onSubmit={babyForm.handleSubmit(handleBabySubmit)}
                  className="space-y-5"
                >
                  {/* Baby Name */}
                  <FormField
                    control={babyForm.control}
                    name="babyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[14px] font-semibold text-zinc-700">
                          Baby's name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter baby's name"
                            className="h-14 rounded-2xl border-zinc-200 bg-white text-[16px] px-4 focus:border-violet-400 focus:ring-violet-400"
                            data-testid="input-baby-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date of Birth */}
                  <FormField
                    control={babyForm.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[14px] font-semibold text-zinc-700">
                          Date of birth
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="h-14 rounded-2xl border-zinc-200 bg-white text-[16px] px-4 focus:border-violet-400 focus:ring-violet-400"
                            data-testid="input-dob"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gender Selection */}
                  <FormField
                    control={babyForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[14px] font-semibold text-zinc-700">
                          Gender
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => field.onChange("boy")}
                              className={`h-14 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${
                                field.value === "boy"
                                  ? "border-blue-400 bg-blue-50 text-blue-600"
                                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                              }`}
                              data-testid="button-gender-boy"
                            >
                              {field.value === "boy" && (
                                <Check className="w-4 h-4" />
                              )}
                              <span className="font-semibold">Boy</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange("girl")}
                              className={`h-14 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${
                                field.value === "girl"
                                  ? "border-pink-400 bg-pink-50 text-pink-600"
                                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                              }`}
                              data-testid="button-gender-girl"
                            >
                              {field.value === "girl" && (
                                <Check className="w-4 h-4" />
                              )}
                              <span className="font-semibold">Girl</span>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Continue Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white rounded-2xl h-14 text-[16px] font-semibold shadow-lg shadow-violet-200/50 gap-2"
                      data-testid="button-continue-step2"
                    >
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}

          {/* Step 3: Ready to Go */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              {/* Celebration Animation */}
              <motion.div
                className="relative mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-violet-500 rounded-full flex items-center justify-center shadow-xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-md"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-4 h-4 text-white fill-white" />
                </motion.div>
              </motion.div>

              <h2
                className="text-[24px] font-bold text-zinc-900 mb-3"
                data-testid="text-step-title"
              >
                {isHospitalOnboarding
                  ? "Confirm your details"
                  : "You're all set!"}
              </h2>
              <p className="text-[15px] text-zinc-500 max-w-[280px] mb-6 leading-relaxed">
                {isHospitalOnboarding ? (
                  <>
                    We found your registration at{" "}
                    <span className="font-semibold text-emerald-700">
                      {hospitalName}
                    </span>
                    . Please verify the details below.
                  </>
                ) : (
                  <>
                    Welcome to Nurture,{" "}
                    <span className="font-semibold text-zinc-700">
                      {caregiverData?.caregiverName || "there"}
                    </span>
                    . We're here to support you and{" "}
                    {babyForm.getValues().babyName || "your little one"} every
                    step of the way.
                  </>
                )}
              </p>

              {/* Hospital Badge */}
              {isHospitalOnboarding && (
                <div className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 justify-center">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-[13px] font-medium text-emerald-700">
                      {hospitalName}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="w-full space-y-3 mb-6">
                {/* Caregiver Summary */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`w-full rounded-2xl p-4 border text-left transition-all hover:shadow-md ${
                    caregiverData?.relationship === "mother"
                      ? "bg-pink-50 border-pink-100 hover:border-pink-200"
                      : caregiverData?.relationship === "father"
                        ? "bg-blue-50 border-blue-100 hover:border-blue-200"
                        : "bg-violet-50 border-violet-100 hover:border-violet-200"
                  }`}
                  data-testid="button-edit-caregiver"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        caregiverData?.relationship === "mother"
                          ? "bg-pink-100"
                          : caregiverData?.relationship === "father"
                            ? "bg-blue-100"
                            : "bg-violet-100"
                      }`}
                    >
                      <span className="text-xl">
                        {caregiverData?.relationship === "mother"
                          ? "👩"
                          : caregiverData?.relationship === "father"
                            ? "👨"
                            : "👤"}
                      </span>
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-[14px] font-semibold text-zinc-900">
                        {caregiverData?.caregiverName}
                      </p>
                      <p
                        className={`text-[12px] ${
                          caregiverData?.relationship === "mother"
                            ? "text-pink-600"
                            : caregiverData?.relationship === "father"
                              ? "text-blue-600"
                              : "text-violet-600"
                        }`}
                      >
                        {getRelationshipLabel()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-medium ${
                          caregiverData?.relationship === "mother"
                            ? "text-pink-500"
                            : caregiverData?.relationship === "father"
                              ? "text-blue-500"
                              : "text-violet-500"
                        }`}
                      >
                        Edit
                      </span>
                      <ArrowRight
                        className={`w-4 h-4 ${
                          caregiverData?.relationship === "mother"
                            ? "text-pink-400"
                            : caregiverData?.relationship === "father"
                              ? "text-blue-400"
                              : "text-violet-400"
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* Baby Summary */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-violet-50 rounded-2xl p-4 border border-violet-100 text-left transition-all hover:shadow-md hover:border-violet-200"
                  data-testid="button-edit-baby"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Baby"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Baby className="w-5 h-5 text-violet-500" />
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-[14px] font-semibold text-zinc-900">
                        {babyForm.getValues().babyName}
                      </p>
                      <p className="text-[12px] text-violet-600">
                        {babyForm.getValues().gender === "boy" ? "Boy" : "Girl"}{" "}
                        • Born {babyForm.getValues().dob}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-violet-500">
                        Edit
                      </span>
                      <ArrowRight className="w-4 h-4 text-violet-400" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Complete Button */}
              <Button
                onClick={handleComplete}
                disabled={createBabyProfile.isPending}
                className={`w-full text-white rounded-2xl h-14 text-[16px] font-semibold shadow-lg gap-2 ${
                  isHospitalOnboarding
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200/50"
                    : "bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 shadow-violet-200/50"
                }`}
                data-testid="button-complete"
              >
                {createBabyProfile.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    {isHospitalOnboarding
                      ? "Confirm & Continue"
                      : "Start your journey"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              {/* Privacy Note */}
              <p className="text-[11px] text-zinc-400 mt-6 leading-relaxed">
                Your data is stored securely and never shared without consent.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hospital Registration Dialog */}
      <Dialog open={showHospitalDialog} onOpenChange={setShowHospitalDialog}>
        <DialogContent
          className="max-w-[340px] rounded-2xl"
          data-testid="dialog-hospital"
        >
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-center">
              Hospital Registration
            </DialogTitle>
            <DialogDescription className="text-[14px] text-zinc-500 text-center mt-2">
              If you registered at a partner hospital, we can pre-fill your
              details.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Button
              variant="outline"
              onClick={handleScanQR}
              className="w-full h-14 rounded-xl border-2 border-violet-200 hover:border-violet-300 hover:bg-violet-50 flex items-center justify-center gap-3"
              data-testid="button-scan-qr"
            >
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <QrCode className="w-5 h-5 text-violet-600" />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-semibold text-zinc-900">
                  Scan QR Code
                </p>
                <p className="text-[12px] text-zinc-500">Use your camera</p>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={handleOpenCodeEntry}
              className="w-full h-14 rounded-xl border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 flex items-center justify-center gap-3"
              data-testid="button-enter-code"
            >
              <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-zinc-600" />
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
        </DialogContent>
      </Dialog>

      {/* Code Entry Dialog */}
      <Dialog open={showCodeEntry} onOpenChange={setShowCodeEntry}>
        <DialogContent
          className="max-w-[340px] rounded-2xl"
          data-testid="dialog-code-entry"
        >
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-center">
              Enter Registration Code
            </DialogTitle>
            <DialogDescription className="text-[14px] text-zinc-500 text-center mt-2">
              Enter the code provided by your hospital
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              value={registrationCode}
              onChange={(e) => {
                setRegistrationCode(e.target.value.toUpperCase());
                setCodeError("");
              }}
              placeholder="e.g., APOLLO2024"
              className="h-14 rounded-xl border-zinc-200 text-center text-[18px] font-mono tracking-widest uppercase"
              data-testid="input-registration-code"
            />
            {codeError && (
              <p
                className="text-[13px] text-red-500 text-center"
                data-testid="text-code-error"
              >
                {codeError}
              </p>
            )}
            <Button
              onClick={handleCodeSubmit}
              className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white rounded-xl h-12 font-semibold"
              data-testid="button-submit-code"
            >
              Verify Code
            </Button>
            <p className="text-[11px] text-zinc-400 text-center">
              Demo codes: APOLLO2024, FORTIS2024, MAX2024
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent
          className="max-w-[340px] rounded-2xl"
          data-testid="dialog-qr-scanner"
        >
          <div className="py-6">
            <div className="relative mx-auto w-48 h-48 bg-zinc-900 rounded-2xl overflow-hidden">
              {/* Scanner Animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                {scanStatus === "scanning" && (
                  <>
                    <motion.div
                      className="absolute w-full h-0.5 bg-violet-500"
                      animate={{ y: [-80, 80, -80] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="absolute inset-4 border-2 border-violet-400/50 rounded-lg" />
                  </>
                )}
                {scanStatus === "found" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                )}
              </div>
              {/* Corner markers */}
              <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-violet-400" />
              <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-violet-400" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-violet-400" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-violet-400" />
            </div>
            <p
              className="text-center mt-4 text-[14px] font-medium text-zinc-700"
              data-testid="text-scan-status"
            >
              {scanStatus === "scanning"
                ? "Scanning..."
                : scanStatus === "found"
                  ? "Code found!"
                  : "Point camera at QR code"}
            </p>
            <p className="text-center text-[12px] text-zinc-500 mt-1">
              {scanStatus === "found"
                ? "Redirecting..."
                : "Position the QR code within the frame"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
