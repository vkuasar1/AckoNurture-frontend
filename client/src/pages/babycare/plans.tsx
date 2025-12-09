import { Link, useLocation } from "wouter";
import { ArrowLeft, Baby, Heart, Sparkles, Check, Smartphone, Syringe, Star, Video, Stethoscope, Users, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { setActivePlans, childPlanDetails, motherPlanDetails, comboPlanDetails } from "@/lib/planStore";

type PlanCategory = "child" | "mother" | "combo" | null;
type ChildPackage = "digital" | "vaccination" | "premium" | null;
type MotherPackage = "recovery" | "wellness" | null;
type ComboPackage = "digital" | "essential" | "premium" | null;

export default function BabyCarePlans() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory>(null);
  const [selectedChildPackage, setSelectedChildPackage] = useState<ChildPackage>(null);
  const [selectedMotherPackage, setSelectedMotherPackage] = useState<MotherPackage>(null);
  const [selectedComboPackage, setSelectedComboPackage] = useState<ComboPackage>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const handleContinue = () => {
    if (selectedCategory) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedChildPackage(null);
      setSelectedMotherPackage(null);
      setSelectedComboPackage(null);
    }
  };

  const handleContinueToPayment = () => {
    // Save the selected plan based on category
    if (selectedCategory === "child" && selectedChildPackage) {
      setActivePlans({ childPlan: selectedChildPackage, motherPlan: null, comboPlan: null });
      const planName = childPlanDetails[selectedChildPackage].name;
      toast({
        title: "Plan activated!",
        description: `You now have the ${planName}.`,
      });
    } else if (selectedCategory === "mother" && selectedMotherPackage) {
      setActivePlans({ childPlan: null, motherPlan: selectedMotherPackage, comboPlan: null });
      const planName = motherPlanDetails[selectedMotherPackage].name;
      toast({
        title: "Plan activated!",
        description: `You now have the ${planName}.`,
      });
    } else if (selectedCategory === "combo" && selectedComboPackage) {
      setActivePlans({ childPlan: null, motherPlan: null, comboPlan: selectedComboPackage });
      const planName = comboPlanDetails[selectedComboPackage].name;
      toast({
        title: "Plan activated!",
        description: `You now have the ${planName}.`,
      });
    }
    
    // Navigate back to the home page to show the active plan
    setTimeout(() => {
      setLocation("/babycare/home");
    }, 1000);
  };

  const getChildPackagePrice = (pkg: ChildPackage): string => {
    switch (pkg) {
      case "digital": return "₹999";
      case "vaccination": return "₹5,999";
      case "premium": return "₹11,999";
      default: return "";
    }
  };

  const getMotherPackagePrice = (pkg: MotherPackage): string => {
    switch (pkg) {
      case "recovery": return "₹1,999";
      case "wellness": return "₹4,999";
      default: return "";
    }
  };

  const getComboPackagePrice = (pkg: ComboPackage): string => {
    switch (pkg) {
      case "digital": return "₹2,499";
      case "essential": return "₹7,999";
      case "premium": return "₹13,999";
      default: return "";
    }
  };

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-[#1a1a1a] text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href={step === 1 ? "/babycare/home" : "#"} data-testid="link-back">
          <button 
            onClick={(e) => {
              if (step === 2) {
                e.preventDefault();
                handleBack();
              }
            }}
            className="p-1.5 -ml-1.5 hover:bg-white/10 rounded-lg transition-colors" 
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold" data-testid="text-page-title">
              {step === 1 ? "Choose a plan" : "Select your package"}
            </h1>
            <p className="text-[12px] text-zinc-400">
              Step {step} of 2
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-28">
        {step === 1 ? (
          <>
            {/* Step 1: Category Selection */}
            <div className="text-center mb-6 pt-2">
              <h2 className="text-[20px] font-bold text-zinc-900 mb-2" data-testid="text-plans-heading">
                What would you like to cover?
              </h2>
              <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[300px] mx-auto">
                You can start with your baby, yourself, or both.
              </p>
            </div>

            {/* Category Selection Cards */}
            <div className="space-y-4">
              {/* Child Wellness */}
              <Card 
                onClick={() => setSelectedCategory("child")}
                className={`bg-white rounded-2xl cursor-pointer transition-all overflow-hidden ${
                  selectedCategory === "child"
                    ? "border-2 border-violet-500 shadow-lg ring-2 ring-violet-200"
                    : "border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200"
                }`}
                data-testid="card-category-child"
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    {/* Radio indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedCategory === "child"
                        ? "border-violet-500 bg-violet-500"
                        : "border-zinc-300"
                    }`}>
                      {selectedCategory === "child" && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedCategory === "child"
                        ? "bg-gradient-to-br from-violet-500 to-violet-600"
                        : "bg-gradient-to-br from-violet-100 to-violet-50"
                    }`}>
                      <Baby className={`w-7 h-7 ${selectedCategory === "child" ? "text-white" : "text-violet-600"}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-bold text-zinc-900 mb-1">Child Wellness</h3>
                      <p className="text-[13px] text-zinc-500 leading-snug">
                        Digital baby care tools, vaccines & growth support options.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mother Wellness */}
              <Card 
                onClick={() => setSelectedCategory("mother")}
                className={`bg-white rounded-2xl cursor-pointer transition-all overflow-hidden ${
                  selectedCategory === "mother"
                    ? "border-2 border-pink-500 shadow-lg ring-2 ring-pink-200"
                    : "border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200"
                }`}
                data-testid="card-category-mother"
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    {/* Radio indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedCategory === "mother"
                        ? "border-pink-500 bg-pink-500"
                        : "border-zinc-300"
                    }`}>
                      {selectedCategory === "mother" && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedCategory === "mother"
                        ? "bg-gradient-to-br from-pink-500 to-pink-600"
                        : "bg-gradient-to-br from-pink-100 to-pink-50"
                    }`}>
                      <Heart className={`w-7 h-7 ${selectedCategory === "mother" ? "text-white" : "text-pink-600"}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-bold text-zinc-900 mb-1">Mother Wellness</h3>
                      <p className="text-[13px] text-zinc-500 leading-snug">
                        Support for your recovery, breastfeeding, mood and more.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mother + Child Combo */}
              <Card 
                onClick={() => setSelectedCategory("combo")}
                className={`bg-white rounded-2xl cursor-pointer transition-all overflow-hidden relative ${
                  selectedCategory === "combo"
                    ? "border-2 border-violet-500 shadow-lg ring-2 ring-violet-200"
                    : "border-2 border-violet-200 shadow-sm hover:shadow-md"
                }`}
                data-testid="card-category-combo"
              >
                {/* Recommended Badge */}
                <div className="absolute top-0 right-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-sm">
                  RECOMMENDED
                </div>
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4 pt-5">
                    {/* Radio indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedCategory === "combo"
                        ? "border-violet-500 bg-gradient-to-r from-violet-500 to-pink-500"
                        : "border-zinc-300"
                    }`}>
                      {selectedCategory === "combo" && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      selectedCategory === "combo"
                        ? "bg-gradient-to-br from-violet-500 to-pink-500"
                        : "bg-gradient-to-br from-violet-400 to-pink-400"
                    }`}>
                      <div className="flex items-center -space-x-1">
                        <Baby className="w-5 h-5 text-white" />
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-bold text-zinc-900 mb-1">Mother + Child Combo</h3>
                      <p className="text-[13px] text-zinc-500 leading-snug">
                        A complete family care bundle for both of you.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : selectedCategory === "child" ? (
          /* Step 2: Child Wellness Packages */
          <>
            <div className="text-center mb-6 pt-2">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Baby className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-[20px] font-bold text-zinc-900 mb-2" data-testid="text-packages-heading">
                Child Wellness Packages
              </h2>
              <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[300px] mx-auto">
                Choose the package that best fits your needs.
              </p>
            </div>

            {/* Package Cards */}
            <div className="space-y-4">
              {/* Package 1: Digital Wellness Pack */}
              <Card 
                onClick={() => setSelectedChildPackage("digital")}
                className={`bg-white rounded-2xl cursor-pointer transition-all overflow-hidden ${
                  selectedChildPackage === "digital"
                    ? "border-2 border-violet-500 shadow-lg ring-2 ring-violet-200"
                    : "border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200"
                }`}
                data-testid="card-package-digital"
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedChildPackage === "digital" 
                          ? "bg-violet-500" 
                          : "bg-violet-100"
                      }`}>
                        <Smartphone className={`w-5 h-5 ${
                          selectedChildPackage === "digital" ? "text-white" : "text-violet-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-zinc-900">Child Digital Wellness Pack</h3>
                        <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 text-[10px] mt-1">
                          Digital only
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedChildPackage === "digital"
                        ? "border-violet-500 bg-violet-500"
                        : "border-zinc-300"
                    }`}>
                      {selectedChildPackage === "digital" && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Full BabyCare digital product</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Unlimited AaI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Vaccine tracking + logs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Growth tracking (no percentiles)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Monthly wellness summary</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <div>
                      <span className="text-[22px] font-bold text-zinc-900">₹999</span>
                      <span className="text-[13px] text-zinc-500 ml-1">/ year</span>
                    </div>
                    <Button 
                      variant={selectedChildPackage === "digital" ? "default" : "outline"}
                      size="sm"
                      className={`rounded-lg ${
                        selectedChildPackage === "digital"
                          ? "bg-violet-600 hover:bg-violet-700"
                          : "text-violet-600 border-violet-200 hover:bg-violet-50"
                      }`}
                      data-testid="button-select-digital"
                    >
                      {selectedChildPackage === "digital" ? "Selected" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Package 2: Vaccination & Checkup Pack */}
              <Card 
                onClick={() => setSelectedChildPackage("vaccination")}
                className={`bg-white rounded-2xl cursor-pointer transition-all overflow-hidden relative ${
                  selectedChildPackage === "vaccination"
                    ? "border-2 border-violet-500 shadow-lg ring-2 ring-violet-200"
                    : "border-2 border-violet-200 shadow-sm hover:shadow-md"
                }`}
                data-testid="card-package-vaccination"
              >
                {/* Most Popular Badge */}
                <div className="absolute top-0 right-4 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-sm">
                  MOST POPULAR
                </div>
                <CardContent className="p-4 pt-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedChildPackage === "vaccination" 
                          ? "bg-violet-500" 
                          : "bg-blue-100"
                      }`}>
                        <Syringe className={`w-5 h-5 ${
                          selectedChildPackage === "vaccination" ? "text-white" : "text-blue-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-zinc-900">Vaccination & Checkup Pack</h3>
                        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-[10px] mt-1">
                          Most popular
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedChildPackage === "vaccination"
                        ? "border-violet-500 bg-violet-500"
                        : "border-zinc-300"
                    }`}>
                      {selectedChildPackage === "vaccination" && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Everything in Digital Pack</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Vaccines at partner hospital</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">2 pediatric checkups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Appointment assistance</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <div>
                      <span className="text-[22px] font-bold text-zinc-900">₹5,999</span>
                      <span className="text-[13px] text-zinc-500 ml-1">/ year</span>
                    </div>
                    <Button 
                      variant={selectedChildPackage === "vaccination" ? "default" : "outline"}
                      size="sm"
                      className={`rounded-lg ${
                        selectedChildPackage === "vaccination"
                          ? "bg-violet-600 hover:bg-violet-700"
                          : "text-violet-600 border-violet-200 hover:bg-violet-50"
                      }`}
                      data-testid="button-select-vaccination"
                    >
                      {selectedChildPackage === "vaccination" ? "Selected" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Package 3: Premium Growth Care Pack */}
              <Card 
                onClick={() => setSelectedChildPackage("premium")}
                className={`bg-white rounded-2xl cursor-pointer transition-all overflow-hidden ${
                  selectedChildPackage === "premium"
                    ? "border-2 border-violet-500 shadow-lg ring-2 ring-violet-200"
                    : "border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200"
                }`}
                data-testid="card-package-premium"
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedChildPackage === "premium" 
                          ? "bg-violet-500" 
                          : "bg-amber-100"
                      }`}>
                        <Star className={`w-5 h-5 ${
                          selectedChildPackage === "premium" ? "text-white" : "text-amber-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-zinc-900">Premium Growth Care Pack</h3>
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px] mt-1">
                          All-round support
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedChildPackage === "premium"
                        ? "border-violet-500 bg-violet-500"
                        : "border-zinc-300"
                    }`}>
                      {selectedChildPackage === "premium" && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Everything in Vaccination Pack</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Limited nanny support (3 calls/month)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">1 child nutrition consult</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">1 sleep guidance session</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <div>
                      <span className="text-[22px] font-bold text-zinc-900">₹11,999</span>
                      <span className="text-[13px] text-zinc-500 ml-1">/ year</span>
                    </div>
                    <Button 
                      variant={selectedChildPackage === "premium" ? "default" : "outline"}
                      size="sm"
                      className={`rounded-lg ${
                        selectedChildPackage === "premium"
                          ? "bg-violet-600 hover:bg-violet-700"
                          : "text-violet-600 border-violet-200 hover:bg-violet-50"
                      }`}
                      data-testid="button-select-premium"
                    >
                      {selectedChildPackage === "premium" ? "Selected" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : selectedCategory === "mother" ? (
          /* Step 2: Mother Wellness Packages */
          <>
            <div className="text-center mb-6 pt-2">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-[20px] font-bold text-zinc-900 mb-2" data-testid="text-packages-heading">
                Mother Wellness Packages
              </h2>
              <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[300px] mx-auto">
                Choose the package that best fits your recovery needs.
              </p>
            </div>

            {/* Package Cards */}
            <div className="space-y-4">
              {/* Package 1: Mother Recovery Pack */}
              <Card 
                onClick={() => setSelectedMotherPackage("recovery")}
                className={`bg-white rounded-2xl cursor-pointer transition-all overflow-hidden ${
                  selectedMotherPackage === "recovery"
                    ? "border-2 border-pink-500 shadow-lg ring-2 ring-pink-200"
                    : "border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200"
                }`}
                data-testid="card-package-recovery"
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedMotherPackage === "recovery" 
                          ? "bg-pink-500" 
                          : "bg-pink-100"
                      }`}>
                        <Video className={`w-5 h-5 ${
                          selectedMotherPackage === "recovery" ? "text-white" : "text-pink-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-zinc-900">Mother Recovery Pack</h3>
                        <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100 text-[10px] mt-1">
                          Video consults
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedMotherPackage === "recovery"
                        ? "border-pink-500 bg-pink-500"
                        : "border-zinc-300"
                    }`}>
                      {selectedMotherPackage === "recovery" && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Postpartum recovery tips</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">1 lactation consult (video)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">1 physiotherapy consult (video)</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <div>
                      <span className="text-[22px] font-bold text-zinc-900">₹1,999</span>
                      <span className="text-[12px] text-zinc-400 ml-1 block">one-time (~3-month validity)</span>
                    </div>
                    <Button 
                      variant={selectedMotherPackage === "recovery" ? "default" : "outline"}
                      size="sm"
                      className={`rounded-lg ${
                        selectedMotherPackage === "recovery"
                          ? "bg-pink-600 hover:bg-pink-700"
                          : "text-pink-600 border-pink-200 hover:bg-pink-50"
                      }`}
                      data-testid="button-select-recovery"
                    >
                      {selectedMotherPackage === "recovery" ? "Selected" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Package 2: Mother Wellness Care Pack */}
              <Card 
                onClick={() => setSelectedMotherPackage("wellness")}
                className={`bg-white rounded-2xl cursor-pointer transition-all overflow-hidden relative ${
                  selectedMotherPackage === "wellness"
                    ? "border-2 border-pink-500 shadow-lg ring-2 ring-pink-200"
                    : "border-2 border-pink-200 shadow-sm hover:shadow-md"
                }`}
                data-testid="card-package-wellness"
              >
                {/* Comprehensive Badge */}
                <div className="absolute top-0 right-4 bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-sm">
                  COMPREHENSIVE
                </div>
                <CardContent className="p-4 pt-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedMotherPackage === "wellness" 
                          ? "bg-pink-500" 
                          : "bg-rose-100"
                      }`}>
                        <Stethoscope className={`w-5 h-5 ${
                          selectedMotherPackage === "wellness" ? "text-white" : "text-rose-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-zinc-900">Mother Wellness Care Pack</h3>
                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 text-[10px] mt-1">
                          Full support
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedMotherPackage === "wellness"
                        ? "border-pink-500 bg-pink-500"
                        : "border-zinc-300"
                    }`}>
                      {selectedMotherPackage === "wellness" && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Everything in Recovery Pack</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">1 in-person physio session (or extra video)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">1 mental wellness consultation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-600">Basic nutrition guidance</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <div>
                      <span className="text-[22px] font-bold text-zinc-900">₹4,999</span>
                      <span className="text-[12px] text-zinc-400 ml-1 block">one-time</span>
                    </div>
                    <Button 
                      variant={selectedMotherPackage === "wellness" ? "default" : "outline"}
                      size="sm"
                      className={`rounded-lg ${
                        selectedMotherPackage === "wellness"
                          ? "bg-pink-600 hover:bg-pink-700"
                          : "text-pink-600 border-pink-200 hover:bg-pink-50"
                      }`}
                      data-testid="button-select-wellness"
                    >
                      {selectedMotherPackage === "wellness" ? "Selected" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          /* Step 2: Mother + Child Combo Packages */
          <>
            <div className="text-center mb-6 pt-2">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                <div className="flex items-center -space-x-1">
                  <Baby className="w-5 h-5 text-white" />
                  <Heart className="w-5 h-5 text-white" />
                </div>
              </div>
              <h2 className="text-[20px] font-bold text-zinc-900 mb-2" data-testid="text-packages-heading">
                Mother + Child Combo Packages
              </h2>
              <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[300px] mx-auto">
                Complete care bundles for both you and your baby.
              </p>
            </div>

            {/* Package Cards */}
            <div className="space-y-4">
              {/* Package 1: Digital Wellness Combo */}
              <Card 
                onClick={() => setSelectedComboPackage("digital")}
                className={`bg-white rounded-2xl cursor-pointer transition-all overflow-hidden ${
                  selectedComboPackage === "digital"
                    ? "border-2 border-violet-500 shadow-lg ring-2 ring-violet-200"
                    : "border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200"
                }`}
                data-testid="card-package-combo-digital"
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedComboPackage === "digital" 
                          ? "bg-gradient-to-br from-violet-500 to-pink-500" 
                          : "bg-gradient-to-br from-violet-100 to-pink-100"
                      }`}>
                        <Smartphone className={`w-5 h-5 ${
                          selectedComboPackage === "digital" ? "text-white" : "text-violet-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-zinc-900">Digital Wellness Combo</h3>
                        <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 text-[10px] mt-1">
                          Digital only
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedComboPackage === "digital"
                        ? "border-violet-500 bg-gradient-to-r from-violet-500 to-pink-500"
                        : "border-zinc-300"
                    }`}>
                      {selectedComboPackage === "digital" && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <Baby className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[13px] text-zinc-600">Child Digital Wellness Pack</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[13px] text-zinc-600">Mother Recovery Pack (digital)</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <div>
                      <span className="text-[22px] font-bold bg-gradient-to-r from-violet-700 to-pink-700 bg-clip-text text-transparent">₹2,499</span>
                      <span className="text-[13px] text-zinc-500 ml-1">/ year</span>
                    </div>
                    <Button 
                      variant={selectedComboPackage === "digital" ? "default" : "outline"}
                      size="sm"
                      className={`rounded-lg ${
                        selectedComboPackage === "digital"
                          ? "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
                          : "text-violet-600 border-violet-200 hover:bg-violet-50"
                      }`}
                      data-testid="button-select-combo-digital"
                    >
                      {selectedComboPackage === "digital" ? "Selected" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Package 2: Essential Care Combo */}
              <Card 
                onClick={() => setSelectedComboPackage("essential")}
                className={`bg-white rounded-2xl cursor-pointer transition-all overflow-hidden relative ${
                  selectedComboPackage === "essential"
                    ? "border-2 border-violet-500 shadow-lg ring-2 ring-violet-200"
                    : "border-2 border-violet-200 shadow-sm hover:shadow-md"
                }`}
                data-testid="card-package-combo-essential"
              >
                {/* Most Popular Badge */}
                <div className="absolute top-0 right-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-sm">
                  MOST POPULAR
                </div>
                <CardContent className="p-4 pt-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedComboPackage === "essential" 
                          ? "bg-gradient-to-br from-violet-500 to-pink-500" 
                          : "bg-gradient-to-br from-blue-100 to-pink-100"
                      }`}>
                        <Package className={`w-5 h-5 ${
                          selectedComboPackage === "essential" ? "text-white" : "text-blue-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-zinc-900">Essential Care Combo</h3>
                        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-[10px] mt-1">
                          Most popular
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedComboPackage === "essential"
                        ? "border-violet-500 bg-gradient-to-r from-violet-500 to-pink-500"
                        : "border-zinc-300"
                    }`}>
                      {selectedComboPackage === "essential" && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <Baby className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[13px] text-zinc-600">Vaccination & Checkup Pack (child)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[13px] text-zinc-600">Mother Recovery Pack</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <div>
                      <span className="text-[22px] font-bold bg-gradient-to-r from-violet-700 to-pink-700 bg-clip-text text-transparent">₹7,999</span>
                      <span className="text-[13px] text-zinc-500 ml-1">/ year</span>
                    </div>
                    <Button 
                      variant={selectedComboPackage === "essential" ? "default" : "outline"}
                      size="sm"
                      className={`rounded-lg ${
                        selectedComboPackage === "essential"
                          ? "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
                          : "text-violet-600 border-violet-200 hover:bg-violet-50"
                      }`}
                      data-testid="button-select-combo-essential"
                    >
                      {selectedComboPackage === "essential" ? "Selected" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Package 3: Premium Care Combo */}
              <Card 
                onClick={() => setSelectedComboPackage("premium")}
                className={`bg-white rounded-2xl cursor-pointer transition-all overflow-hidden ${
                  selectedComboPackage === "premium"
                    ? "border-2 border-violet-500 shadow-lg ring-2 ring-violet-200"
                    : "border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200"
                }`}
                data-testid="card-package-combo-premium"
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedComboPackage === "premium" 
                          ? "bg-gradient-to-br from-violet-500 to-pink-500" 
                          : "bg-gradient-to-br from-amber-100 to-rose-100"
                      }`}>
                        <Star className={`w-5 h-5 ${
                          selectedComboPackage === "premium" ? "text-white" : "text-amber-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-zinc-900">Premium Care Combo</h3>
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px] mt-1">
                          All-round support
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedComboPackage === "premium"
                        ? "border-violet-500 bg-gradient-to-r from-violet-500 to-pink-500"
                        : "border-zinc-300"
                    }`}>
                      {selectedComboPackage === "premium" && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <Baby className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[13px] text-zinc-600">Premium Growth Care Pack (child)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[13px] text-zinc-600">Mother Wellness Care Pack</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <div>
                      <span className="text-[22px] font-bold bg-gradient-to-r from-violet-700 to-pink-700 bg-clip-text text-transparent">₹13,999</span>
                      <span className="text-[13px] text-zinc-500 ml-1">/ year</span>
                    </div>
                    <Button 
                      variant={selectedComboPackage === "premium" ? "default" : "outline"}
                      size="sm"
                      className={`rounded-lg ${
                        selectedComboPackage === "premium"
                          ? "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
                          : "text-violet-600 border-violet-200 hover:bg-violet-50"
                      }`}
                      data-testid="button-select-combo-premium"
                    >
                      {selectedComboPackage === "premium" ? "Selected" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {step === 1 ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 shadow-lg">
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleContinue}
              disabled={!selectedCategory}
              className={`w-full py-6 rounded-xl font-semibold text-[15px] transition-all ${
                selectedCategory
                  ? "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white shadow-md"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              }`}
              data-testid="button-continue"
            >
              Continue
            </Button>
          </div>
        </div>
      ) : selectedCategory === "child" ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 shadow-lg">
          <div className="max-w-md mx-auto">
            {selectedChildPackage && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-zinc-500">Selected package:</span>
                <span className="text-[15px] font-bold text-zinc-900">
                  {getChildPackagePrice(selectedChildPackage)}/year
                </span>
              </div>
            )}
            <Button
              onClick={handleContinueToPayment}
              disabled={!selectedChildPackage}
              className={`w-full py-6 rounded-xl font-semibold text-[15px] transition-all ${
                selectedChildPackage
                  ? "bg-violet-600 hover:bg-violet-700 text-white shadow-md"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              }`}
              data-testid="button-continue-payment"
            >
              Continue to payment
            </Button>
          </div>
        </div>
      ) : selectedCategory === "mother" ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 shadow-lg">
          <div className="max-w-md mx-auto">
            {selectedMotherPackage && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-zinc-500">Selected package:</span>
                <span className="text-[15px] font-bold text-zinc-900">
                  {getMotherPackagePrice(selectedMotherPackage)}
                </span>
              </div>
            )}
            <Button
              onClick={handleContinueToPayment}
              disabled={!selectedMotherPackage}
              className={`w-full py-6 rounded-xl font-semibold text-[15px] transition-all ${
                selectedMotherPackage
                  ? "bg-pink-600 hover:bg-pink-700 text-white shadow-md"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              }`}
              data-testid="button-continue-payment-mother"
            >
              Continue to payment
            </Button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 shadow-lg">
          <div className="max-w-md mx-auto">
            {selectedComboPackage && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-zinc-500">Selected package:</span>
                <span className="text-[15px] font-bold bg-gradient-to-r from-violet-700 to-pink-700 bg-clip-text text-transparent">
                  {getComboPackagePrice(selectedComboPackage)}/year
                </span>
              </div>
            )}
            <Button
              onClick={handleContinueToPayment}
              disabled={!selectedComboPackage}
              className={`w-full py-6 rounded-xl font-semibold text-[15px] transition-all ${
                selectedComboPackage
                  ? "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white shadow-md"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              }`}
              data-testid="button-continue-payment-combo"
            >
              Continue to payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
