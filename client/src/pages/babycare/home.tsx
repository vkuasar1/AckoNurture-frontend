import { Link, useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Syringe, 
  TrendingUp, 
  Star, 
  MessageSquare,
  ChevronRight,
  FileText,
  Plus,
  Calendar,
  User2,
  ClipboardList,
  Settings,
  Sparkles,
  Baby,
  Heart,
  Lock,
  Stethoscope,
  Brain,
  Milk,
  Flower2,
  Smile,
  Activity,
  Phone,
  BookOpen,
  Dumbbell,
  Apple,
  Sparkle,
  X,
  Crown,
  Check,
  Shield,
  Bell,
  Building2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Bot,
  Moon,
  Target
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import type { BabyProfile, Vaccine, GrowthEntry, Milestone } from "@shared/schema";
import { differenceInMonths, differenceInDays, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  getActivePlans, 
  hasChildPlan as checkChildPlan, 
  hasMotherPlan as checkMotherPlan,
  clearActivePlans,
  childPlanDetails,
  motherPlanDetails,
  comboPlanDetails,
  type ActivePlans
} from "@/lib/planStore";
import { getCaregiverProfile, isCaregiverSetupComplete, type CaregiverProfile } from "@/lib/caregiverStore";

function calculateAge(dob: string): { display: string; months: number; days: number } {
  const birthDate = new Date(dob);
  const today = new Date();
  const totalMonths = differenceInMonths(today, birthDate);
  const totalDays = differenceInDays(today, birthDate);
  const remainingDays = totalDays - (totalMonths * 30);
  
  if (totalMonths < 1) {
    return { display: `${totalDays} day${totalDays !== 1 ? "s" : ""}`, months: 0, days: totalDays };
  } else if (totalMonths < 12) {
    return { 
      display: `${totalMonths} month${totalMonths !== 1 ? "s" : ""} ${Math.max(0, remainingDays)} days`, 
      months: totalMonths, 
      days: remainingDays 
    };
  } else {
    const years = Math.floor(totalMonths / 12);
    const monthsRemaining = totalMonths % 12;
    return { 
      display: `${years}y ${monthsRemaining}m`, 
      months: totalMonths, 
      days: remainingDays 
    };
  }
}

function getAgeGroupLabel(months: number): string {
  if (months < 2) return "0–2 month skills";
  if (months < 4) return "2–4 month skills";
  if (months < 6) return "4–6 month skills";
  if (months < 9) return "6–9 month skills";
  if (months < 12) return "9–12 month skills";
  return "1+ year skills";
}

function getExampleMilestones(months: number): string {
  if (months < 2) return "Focuses on faces • Makes cooing sounds";
  if (months < 4) return "Smiles at people • Makes cooing sounds • Holds head up";
  if (months < 6) return "Laughs • Reaches for toys • Rolls over";
  if (months < 9) return "Sits without support • Responds to name • Babbles";
  if (months < 12) return "Crawls • Stands with support • Says mama/dada";
  return "Walks • Says several words • Points to objects";
}

function getDaysUntilDue(dueDate: string): number {
  return differenceInDays(new Date(dueDate), new Date());
}

function getDueStatus(dueDate: string): { label: string; variant: "default" | "destructive" | "secondary" } {
  const days = getDaysUntilDue(dueDate);
  if (days < 0) return { label: "Overdue", variant: "destructive" };
  if (days === 0) return { label: "Due today", variant: "destructive" };
  if (days <= 7) return { label: "Due soon", variant: "default" };
  return { label: `Due in ${days} days`, variant: "secondary" };
}

type CareTab = "baby" | "mother";

export default function BabyCareHome() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showSpecialistsModal, setShowSpecialistsModal] = useState(false);
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState<"child" | "mother" | null>(null);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [reminderVaccine, setReminderVaccine] = useState<Vaccine | null>(null);
  const [reminderType, setReminderType] = useState<"call" | "sms" | "push">("call");
  const [reminderTime, setReminderTime] = useState<"1day" | "3days" | "1week">("1day");
  const [showCaregiverPitchModal, setShowCaregiverPitchModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const babyId = params.babyId;
  
  // Caregiver profile state
  const [caregiverProfile, setCaregiverProfileState] = useState<CaregiverProfile | null>(null);
  const isCaregiverComplete = caregiverProfile?.setupCompleted === true;
  
  // Read tab from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get("tab") === "mother" ? "mother" : "baby";
  const [activeTab, setActiveTab] = useState<CareTab>(initialTab);
  
  // Get active plans from localStorage
  const [activePlans, setActivePlansState] = useState<ActivePlans>({ childPlan: null, motherPlan: null, comboPlan: null });
  
  useEffect(() => {
    // Load active plans on mount
    setActivePlansState(getActivePlans());
    // Load caregiver profile on mount
    setCaregiverProfileState(getCaregiverProfile());
  }, []);
  
  // Check if user has plans based on stored data
  const userHasChildPlan = checkChildPlan(activePlans);
  const userHasMotherPlan = checkMotherPlan(activePlans);
  
  // Get current plan details for display
  const getCurrentChildPlanInfo = () => {
    if (activePlans.comboPlan) {
      const combo = comboPlanDetails[activePlans.comboPlan];
      return {
        name: combo.name,
        description: combo.shortDescription,
        childPart: combo.childPart,
        isCombo: true
      };
    }
    if (activePlans.childPlan) {
      const plan = childPlanDetails[activePlans.childPlan];
      return {
        name: plan.name,
        description: plan.shortDescription,
        benefits: plan.benefits,
        isCombo: false
      };
    }
    return null;
  };
  
  const getCurrentMotherPlanInfo = () => {
    if (activePlans.comboPlan) {
      const combo = comboPlanDetails[activePlans.comboPlan];
      return {
        name: combo.name,
        description: combo.shortDescription,
        motherPart: combo.motherPart,
        isCombo: true
      };
    }
    if (activePlans.motherPlan) {
      const plan = motherPlanDetails[activePlans.motherPlan];
      return {
        name: plan.name,
        description: plan.shortDescription,
        benefits: plan.benefits,
        isCombo: false
      };
    }
    return null;
  };
  
  const childPlanInfo = getCurrentChildPlanInfo();
  const motherPlanInfo = getCurrentMotherPlanInfo();
  
  // For backward compatibility with existing hasMotherPlan checks
  const hasMotherPlan = userHasMotherPlan;
  
  // Mother profile data - uses stored caregiver profile or placeholder
  const motherProfile = isCaregiverComplete && caregiverProfile ? {
    name: caregiverProfile.name,
    weeksPostpartum: caregiverProfile.weeksPostpartum || 0,
    planActive: hasMotherPlan,
    sessionsRemaining: {
      lactation: 3,
      physio: 2,
      nutrition: 4,
      mentalHealth: 5
    }
  } : null;
  
  // Handler for clicking on mother tile when not set up
  const handleMotherTileClick = () => {
    if (isCaregiverComplete) {
      setActiveTab("mother");
    } else {
      setShowCaregiverPitchModal(true);
    }
  };
  
  // Navigate to caregiver setup
  const handleAddCaregiverProfile = () => {
    setShowCaregiverPitchModal(false);
    setLocation("/babycare/setup?includeMother=true&returnTo=home");
  };

  const { data: profiles = [] } = useQuery<BabyProfile[]>({
    queryKey: ["/api/baby-profiles"],
  });

  const baby = babyId 
    ? profiles.find(p => p.id === babyId) 
    : profiles[0];

  const { data: vaccines = [] } = useQuery<Vaccine[]>({
    queryKey: ["/api/baby-profiles", baby?.id, "vaccines"],
    enabled: !!baby?.id,
  });

  const { data: growthEntries = [] } = useQuery<GrowthEntry[]>({
    queryKey: ["/api/baby-profiles", baby?.id, "growth"],
    enabled: !!baby?.id,
  });

  const { data: milestones = [] } = useQuery<Milestone[]>({
    queryKey: ["/api/baby-profiles", baby?.id, "milestones"],
    enabled: !!baby?.id,
  });

  const upcomingVaccines = vaccines
    .filter(v => v.status === "pending" && v.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 2);

  const latestWeight = growthEntries.find(e => e.type === "weight");
  const latestHeight = growthEntries.find(e => e.type === "height");

  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;

  const babyAge = baby ? calculateAge(baby.dob) : { display: "", months: 0, days: 0 };
  
  // Check if user came from mother-only onboarding
  const isMotherOnlyMode = !baby && activeTab === "mother";

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col relative">
      {/* Rich Gradient Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white px-4 pt-3 pb-5">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/10 rounded-full h-9 w-9"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-[17px] font-bold">Nurture</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/10 rounded-full h-9 w-9"
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Active Profile Hero - Baby or Mother */}
        {activeTab === "baby" && baby ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3" data-testid="hero-baby-profile">
            <div className="flex items-center gap-4">
              {/* Large Baby Avatar with Decorations */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white/20 border-3 border-white/40 flex items-center justify-center overflow-hidden shadow-lg">
                  {baby.photoUrl ? (
                    <img src={baby.photoUrl} alt={baby.name} className="w-full h-full object-cover" data-testid="img-baby-photo-hero" />
                  ) : (
                    <Smile className="w-9 h-9 text-white" />
                  )}
                </div>
                {/* Sparkle decoration */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              
              {/* Baby Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-[20px] font-bold text-white mb-2 truncate" data-testid="text-baby-name-hero">
                  {baby.name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-[12px] font-semibold text-white" data-testid="text-baby-age-hero">
                      {babyAge.display} old
                    </span>
                  </div>
                  {baby.gender && (
                    <div className={`px-2.5 py-1 rounded-full ${baby.gender === 'boy' ? 'bg-blue-400/40' : 'bg-pink-400/40'}`}>
                      <span className="text-[11px] font-semibold text-white capitalize">{baby.gender}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan Button */}
              {userHasChildPlan && childPlanInfo ? (
                <button
                  onClick={() => setShowPlanDetailsModal("child")}
                  className="flex flex-col items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 transition-colors"
                  data-testid="card-your-plan-baby"
                >
                  <Crown className="w-6 h-6 text-amber-300" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wide">Plan</span>
                </button>
              ) : (
                <Link href="/babycare/plans" data-testid="link-explore-plans-baby">
                  <div className="flex flex-col items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 transition-colors" data-testid="card-explore-plans-baby">
                    <Crown className="w-6 h-6 text-amber-300" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wide">Plan</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        ) : activeTab === "mother" && motherProfile ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3" data-testid="hero-mother-profile">
            <div className="flex items-center gap-4">
              {/* Large Mother Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white/20 border-3 border-white/40 flex items-center justify-center shadow-lg">
                  <Heart className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkle className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              
              {/* Mother Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-[20px] font-bold text-white mb-2 truncate" data-testid="text-mother-name-hero">
                  {motherProfile.name}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-[12px] font-semibold text-white">
                      {motherProfile.weeksPostpartum}w postpartum
                    </span>
                  </div>
                </div>
              </div>

              {/* Plan Button */}
              {userHasMotherPlan && motherPlanInfo ? (
                <button
                  onClick={() => setShowPlanDetailsModal("mother")}
                  className="flex flex-col items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 transition-colors"
                  data-testid="card-your-plan-mother-hero"
                >
                  <Crown className="w-6 h-6 text-amber-300" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wide">Plan</span>
                </button>
              ) : (
                <Link href="/babycare/plans" data-testid="link-explore-plans-mother">
                  <div className="flex flex-col items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 transition-colors">
                    <Crown className="w-6 h-6 text-amber-300" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wide">Plan</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        ) : null}

        {/* Tab Switcher - Compact Pills */}
        <div className="flex gap-2" data-testid="profile-tiles-container">
          {/* Baby Tab */}
          {baby ? (
            <button
              onClick={() => setActiveTab("baby")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                activeTab === "baby"
                  ? "bg-white text-violet-700 shadow-md"
                  : "bg-white/15 text-white/80 hover:bg-white/25"
              }`}
              data-testid="tile-baby-profile"
            >
              <Baby className="w-4 h-4" />
              <span className="text-[13px] font-semibold">{baby.name}</span>
            </button>
          ) : (
            <Link href="/babycare/setup?includeBaby=true">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white/70 hover:bg-white/25 border border-dashed border-white/30"
                data-testid="tile-add-baby"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[13px] font-medium">Add Baby</span>
              </div>
            </Link>
          )}

          {/* Mother Tab */}
          {motherProfile ? (
            <button
              onClick={handleMotherTileClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                activeTab === "mother"
                  ? "bg-white text-pink-700 shadow-md"
                  : "bg-white/15 text-white/80 hover:bg-white/25"
              }`}
              data-testid="tile-mother-profile"
            >
              <Heart className="w-4 h-4" />
              <span className="text-[13px] font-semibold">{motherProfile.name}</span>
            </button>
          ) : (
            <button
              onClick={handleMotherTileClick}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white/70 hover:bg-white/25 border border-dashed border-white/30"
              data-testid="tile-add-caregiver"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[13px] font-medium">My Wellness</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3">
        {activeTab === "baby" ? (
          baby ? (
          <div className="space-y-3">
            {/* Vaccine Tracker - Rich Design */}
            <Card className="bg-white border border-zinc-100 shadow-md rounded-2xl overflow-hidden" data-testid="card-vaccines">
              <CardContent className="p-0">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-white">Vaccine Schedule</h3>
                      <p className="text-[11px] text-blue-100">
                        {vaccines.filter(v => v.status === 'completed').length} of {vaccines.length} completed
                      </p>
                    </div>
                  </div>
                  <Link href={`/babycare/vaccines/${baby.id}`} data-testid="link-vaccines">
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 text-[11px] h-8">
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                
                {/* Vaccine List */}
                <div className="p-3 space-y-2">
                  {upcomingVaccines.length > 0 ? (
                    <>
                      {upcomingVaccines.slice(0, 2).map((vaccine, idx) => {
                        const status = vaccine.dueDate ? getDueStatus(vaccine.dueDate) : null;
                        const isOverdue = status?.variant === "destructive";
                        return (
                          <div 
                            key={vaccine.id || idx}
                            className={`flex items-center gap-3 p-3 rounded-xl ${isOverdue ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'}`}
                            data-testid={`vaccine-item-${idx}`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-red-100' : 'bg-blue-100'}`}>
                              <Syringe className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-blue-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-zinc-800 truncate" data-testid={`vaccine-name-${idx}`}>
                                {vaccine.name}
                              </p>
                              {status && (
                                <p className={`text-[11px] font-medium ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                                  {status.label}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-red-200 hover:bg-red-300' : 'bg-blue-200 hover:bg-blue-300'} transition-colors`}
                                title="Set Reminder"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setReminderVaccine(vaccine);
                                  setShowReminderDialog(true);
                                }}
                                data-testid={`btn-reminder-${idx}`}
                              >
                                <Bell className={`w-4 h-4 ${isOverdue ? 'text-red-700' : 'text-blue-700'}`} />
                              </button>
                              <button 
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-red-200 hover:bg-red-300' : 'bg-blue-200 hover:bg-blue-300'} transition-colors`}
                                title="Find Hospital"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setLocation(`/babycare/vaccines/${baby.id}?openHospital=${vaccine.id}`);
                                }}
                                data-testid={`btn-hospital-${idx}`}
                              >
                                <Building2 className={`w-4 h-4 ${isOverdue ? 'text-red-700' : 'text-blue-700'}`} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-emerald-800">All caught up!</p>
                        <p className="text-[11px] text-emerald-600">Vaccines are up to date</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Feature Cards - Rich 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Growth Card - Playful Design */}
              <Link href={`/babycare/growth/${baby.id}`} data-testid="link-growth">
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 shadow-md rounded-2xl h-full hover:shadow-lg hover:scale-[1.02] transition-all" data-testid="card-growth">
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full">
                      {/* Large Icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-[14px] font-bold text-zinc-900 mb-1">Growth</h3>
                      {(latestWeight || latestHeight) ? (
                        <div className="space-y-1 mt-auto">
                          <div className="flex items-center gap-2 bg-white/60 rounded-lg px-2 py-1">
                            <span className="text-[11px] text-zinc-500">Wt</span>
                            <span className="text-[12px] font-bold text-emerald-700" data-testid="growth-weight">
                              {latestWeight ? `${latestWeight.value}kg` : "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/60 rounded-lg px-2 py-1">
                            <span className="text-[11px] text-zinc-500">Ht</span>
                            <span className="text-[12px] font-bold text-emerald-700" data-testid="growth-height">
                              {latestHeight ? `${latestHeight.value}cm` : "—"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-emerald-600 mt-1" data-testid="growth-empty">
                          Track height & weight
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Milestones Card - Playful Star Theme */}
              <Link href={`/babycare/milestones/${baby.id}`} data-testid="link-milestones">
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-md rounded-2xl h-full hover:shadow-lg hover:scale-[1.02] transition-all" data-testid="card-milestones">
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full">
                      {/* Large Icon with decorative stars */}
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute top-0 right-0 w-4 h-4 bg-amber-300 rounded-full flex items-center justify-center">
                          <Camera className="w-2.5 h-2.5 text-amber-700" />
                        </div>
                      </div>
                      <h3 className="text-[14px] font-bold text-zinc-900 mb-1">Milestones</h3>
                      <p className="text-[11px] text-amber-700 mb-2" data-testid="text-milestone-examples">
                        Capture precious firsts
                      </p>
                      <div className="mt-auto flex items-center gap-2">
                        <div className="bg-amber-200/60 rounded-full px-2 py-0.5">
                          <span className="text-[11px] font-bold text-amber-800" data-testid="text-milestones-progress">
                            {completedMilestones}/{totalMilestones}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Medical Records Card - Document Theme */}
              <Link href={`/babycare/records/${baby.id}`} data-testid="link-medical-records">
                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 shadow-md rounded-2xl h-full hover:shadow-lg hover:scale-[1.02] transition-all" data-testid="card-records">
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full">
                      {/* Large Icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
                        <ClipboardList className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-[14px] font-bold text-zinc-900 mb-1">Records</h3>
                      <p className="text-[11px] text-violet-600">
                        Prescriptions, reports & health docs
                      </p>
                      <div className="mt-auto pt-2 flex items-center gap-1">
                        <div className="w-6 h-6 bg-violet-200/60 rounded flex items-center justify-center">
                          <FileText className="w-3 h-3 text-violet-600" />
                        </div>
                        <div className="w-6 h-6 bg-violet-200/60 rounded flex items-center justify-center">
                          <FileText className="w-3 h-3 text-violet-600" />
                        </div>
                        <div className="w-6 h-6 bg-violet-100 rounded flex items-center justify-center">
                          <Plus className="w-3 h-3 text-violet-400" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Plans/Summary Card */}
              {!userHasChildPlan ? (
                <Link href="/babycare/plans" data-testid="link-view-plans-baby">
                  <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 shadow-md rounded-2xl h-full hover:shadow-lg hover:scale-[1.02] transition-all" data-testid="card-plans-baby">
                    <CardContent className="p-4">
                      <div className="flex flex-col h-full">
                        {/* Large Icon with sparkle */}
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
                            <Crown className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center animate-bounce">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <h3 className="text-[14px] font-bold text-zinc-900 mb-1">Wellness Plans</h3>
                        <p className="text-[11px] text-pink-600 font-medium">
                          AI Nanny, tracking & more
                        </p>
                        <div className="mt-auto pt-2">
                          <span className="text-[10px] bg-pink-200/60 text-pink-700 font-bold px-2 py-1 rounded-full">
                            Explore
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                /* Summary card when user has plan */
                <Card className="bg-gradient-to-br from-slate-50 to-zinc-100 border border-zinc-200 shadow-md rounded-2xl h-full" data-testid="card-baby-summary">
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-zinc-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-[14px] font-bold text-zinc-900 mb-1">Timeline</h3>
                      <p className="text-[11px] text-zinc-500" data-testid="text-baby-age">
                        Born {format(new Date(baby.dob), "MMM d, yyyy")}
                      </p>
                      <div className="mt-auto pt-2">
                        <span className="text-[10px] bg-zinc-200 text-zinc-700 font-medium px-2 py-1 rounded-full">
                          {babyAge.display}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          ) : (
            /* No baby profile - show add baby CTA */
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                <Baby className="w-10 h-10 text-violet-500" />
              </div>
              <h3 className="text-[18px] font-bold text-zinc-900 mb-2 text-center">
                Add your baby
              </h3>
              <p className="text-[14px] text-zinc-500 text-center mb-6 max-w-xs">
                Start tracking vaccines, growth, and milestones for your little one.
              </p>
              <Link href="/babycare/setup?includeBaby=true">
                <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-xl px-8 gap-2" data-testid="button-add-baby-cta">
                  <Plus className="w-4 h-4" />
                  Add Baby Profile
                </Button>
              </Link>
            </div>
          )
        ) : (
          /* Mother Care Content */
          !motherProfile ? (
            /* Caregiver not set up - show CTA */
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-[18px] font-bold text-zinc-900 mb-2 text-center">
                Your Wellness Matters
              </h3>
              <p className="text-[14px] text-zinc-500 text-center mb-6 max-w-xs">
                Add your profile to access personalized wellness support, self-care tips, and caregiver resources.
              </p>
              <Button 
                onClick={handleAddCaregiverProfile}
                className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold rounded-xl px-8 gap-2" 
                data-testid="button-add-caregiver-cta"
              >
                <Plus className="w-4 h-4" />
                Add My Profile
              </Button>
            </div>
          ) : hasMotherPlan ? (
            /* Full Mother Wellness Dashboard - Clean Design */
            <div className="space-y-4">
              {/* Recovery Card - Clean & Minimal */}
              <Card className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 border-0 shadow-lg rounded-2xl overflow-hidden" data-testid="card-recovery">
                <CardContent className="p-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-white">Your Recovery</h3>
                        <p className="text-[12px] text-pink-100 font-medium">
                          Week {motherProfile?.weeksPostpartum || 8} focus
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-white hover:bg-white/90 text-pink-600 border-0 text-[12px] font-semibold h-8 rounded-full px-4"
                      onClick={() => setShowTipsModal(true)}
                      data-testid="button-view-tips"
                    >
                      View Tips <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </div>
                  
                  {/* Focus Message - Single, Clear */}
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-[15px] font-bold text-white mb-1.5">
                      {(motherProfile?.weeksPostpartum || 8) <= 4 
                        ? "Rest & gentle bonding"
                        : (motherProfile?.weeksPostpartum || 8) <= 6 
                          ? "Pelvic floor & light walks"
                          : (motherProfile?.weeksPostpartum || 8) <= 8
                            ? "Core strengthening & pelvic floor"
                            : (motherProfile?.weeksPostpartum || 8) <= 10
                              ? "Building strength & posture"
                              : "Returning to full activity"}
                    </p>
                    <p className="text-[13px] text-pink-100 leading-relaxed">
                      {(motherProfile?.weeksPostpartum || 8) <= 4 
                        ? "Your body is healing. Prioritize rest and bonding with baby."
                        : (motherProfile?.weeksPostpartum || 8) <= 6 
                          ? "Reconnect with your pelvic floor. Short walks boost mood."
                          : (motherProfile?.weeksPostpartum || 8) <= 8
                            ? "Gentle exercises to rebuild your core muscles after delivery."
                            : (motherProfile?.weeksPostpartum || 8) <= 10
                              ? "Increase activity gradually. Focus on posture while carrying baby."
                              : "With doctor's clearance, return to regular exercise routines."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Cards - 2x2 Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Specialists Card */}
                <Card 
                  className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 shadow-md rounded-2xl h-full hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setShowSpecialistsModal(true)}
                  data-testid="card-specialists"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
                        <User2 className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-[14px] font-bold text-zinc-900 mb-1">Specialists</h3>
                      <p className="text-[11px] text-violet-600 mb-2">
                        Lactation, physio & more
                      </p>
                      <div className="mt-auto">
                        <span className="text-[10px] bg-violet-200/60 text-violet-700 font-bold px-2 py-1 rounded-full">
                          {(motherProfile?.sessionsRemaining?.lactation || 3) + (motherProfile?.sessionsRemaining?.physio || 2)} sessions
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mental Wellness Card */}
                <Link href="/babycare/mental-wellness" data-testid="link-mental-wellness">
                  <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 shadow-md rounded-2xl h-full hover:shadow-lg transition-all cursor-pointer" data-testid="card-mental-wellness">
                    <CardContent className="p-4">
                      <div className="flex flex-col h-full">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-[14px] font-bold text-zinc-900 mb-1">Mental Health</h3>
                        <p className="text-[11px] text-purple-600 mb-2">
                          Mood & wellness tracking
                        </p>
                        <div className="mt-auto">
                          <span className="text-[10px] bg-purple-200/60 text-purple-700 font-bold px-2 py-1 rounded-full">
                            Track mood
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Resources Card */}
                <Link href="/babycare/resources" data-testid="link-resources">
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-md rounded-2xl h-full hover:shadow-lg transition-all cursor-pointer" data-testid="card-resources">
                    <CardContent className="p-4">
                      <div className="flex flex-col h-full">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
                          <Apple className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-[14px] font-bold text-zinc-900 mb-1">Resources</h3>
                        <p className="text-[11px] text-amber-600 mb-2">
                          Exercise, diet & wellness
                        </p>
                        <div className="mt-auto">
                          <span className="text-[10px] bg-amber-200/60 text-amber-700 font-bold px-2 py-1 rounded-full">
                            Explore
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Records Card */}
                <Link href="/babycare/mother-records" data-testid="link-mother-records">
                  <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 shadow-md rounded-2xl h-full hover:shadow-lg transition-all" data-testid="card-mother-records">
                    <CardContent className="p-4">
                      <div className="flex flex-col h-full">
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
                          <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-[14px] font-bold text-zinc-900 mb-1">Records</h3>
                        <p className="text-[11px] text-rose-600 mb-2">
                          Health history & docs
                        </p>
                        <div className="mt-auto">
                          <span className="text-[10px] bg-rose-200/60 text-rose-700 font-bold px-2 py-1 rounded-full">
                            View all
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Explore Plans Card - only show when user doesn't have a plan */}
              {!userHasMotherPlan && (
                <Link href="/babycare/plans" data-testid="link-explore-plans-mother">
                  <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-2xl" data-testid="card-explore-plans-mother">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-zinc-900">Explore Plans</p>
                          <p className="text-[12px] text-zinc-500">Recovery & wellness support</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-pink-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          ) : (
            /* Locked View - No Mother Plan */
            <div className="flex flex-col items-center justify-center py-8" data-testid="mother-locked-view">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <div className="relative">
                  <Heart className="w-10 h-10 text-pink-400" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-[20px] font-bold text-zinc-900 mb-2 text-center" data-testid="text-mother-locked-heading">
                Mother Wellness
              </h2>
              <p className="text-[14px] text-zinc-500 text-center mb-6 max-w-[280px] leading-relaxed" data-testid="text-mother-locked-description">
                Support for your recovery, mental health, lactation and more.
              </p>

              {/* Feature Preview Cards */}
              <div className="w-full space-y-3 mb-6">
                <div className="flex items-center gap-3 bg-white border border-zinc-100 rounded-xl px-4 py-3">
                  <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-700">Postpartum Recovery</p>
                    <p className="text-[12px] text-zinc-500">Track healing milestones</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white border border-zinc-100 rounded-xl px-4 py-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-700">Mental Health Support</p>
                    <p className="text-[12px] text-zinc-500">Mood tracking & resources</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white border border-zinc-100 rounded-xl px-4 py-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Milk className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-700">Lactation Guidance</p>
                    <p className="text-[12px] text-zinc-500">Expert tips & tracking</p>
                  </div>
                </div>
              </div>

              <Link href="/babycare/plans" data-testid="link-explore-mother-plans">
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold rounded-xl py-6"
                  data-testid="button-explore-mother-plans"
                >
                  <Flower2 className="w-4 h-4 mr-2" />
                  Explore Mother Wellness Plans
                </Button>
              </Link>
            </div>
          )
        )}
      </div>

      {/* Upload Report Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-[340px] rounded-2xl" data-testid="dialog-upload-report">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold" data-testid="dialog-title">Upload Report</DialogTitle>
            <DialogDescription className="sr-only">
              Upload medical reports for your baby
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-violet-50 rounded-xl p-4 mb-4 text-center">
              <FileText className="w-10 h-10 text-violet-500 mx-auto mb-2" />
              <p className="text-[14px] font-semibold text-zinc-900" data-testid="dialog-description">
                Report storage coming soon!
              </p>
              <p className="text-[12px] text-zinc-500 mt-1">
                You can still select a file to upload once this feature is ready.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              data-testid="input-file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  toast({
                    title: "File selected",
                    description: `${file.name} will be uploaded when this feature is available.`,
                  });
                  setShowUploadDialog(false);
                }
              }}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
              className="flex-1 rounded-xl"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-violet-600 hover:bg-violet-700 rounded-xl"
              data-testid="button-select-file"
            >
              Select File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recovery Tips Modal */}
      <Dialog open={showTipsModal} onOpenChange={setShowTipsModal}>
        <DialogContent className="max-w-[360px] rounded-2xl max-h-[85vh] overflow-y-auto" data-testid="dialog-tips">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-pink-600" />
              Recovery Tips
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-500">
              Week {motherProfile?.weeksPostpartum || 8} guidance for your recovery
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="bg-pink-50 rounded-xl p-4">
              <h4 className="text-[14px] font-semibold text-pink-700 mb-2">Core Strengthening</h4>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                Start with gentle breathing exercises. Lie on your back, inhale deeply, and engage your pelvic floor as you exhale. Repeat 10 times.
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <h4 className="text-[14px] font-semibold text-purple-700 mb-2">Rest & Sleep</h4>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                Sleep when your baby sleeps. Even short 20-minute naps can help your body heal and restore energy.
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="text-[14px] font-semibold text-blue-700 mb-2">Gentle Movement</h4>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                Short walks around the house or yard can improve circulation and mood. Aim for 10-15 minutes daily.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <h4 className="text-[14px] font-semibold text-amber-700 mb-2">Nutrition</h4>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                Stay hydrated and eat nutrient-rich foods. Focus on iron-rich foods like leafy greens and lean proteins.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowTipsModal(false)}
              className="w-full bg-pink-600 hover:bg-pink-700 rounded-xl"
              data-testid="button-close-tips"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Specialists Modal */}
      <Dialog open={showSpecialistsModal} onOpenChange={setShowSpecialistsModal}>
        <DialogContent className="max-w-[360px] rounded-2xl max-h-[85vh] overflow-y-auto" data-testid="dialog-specialists">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold flex items-center gap-2">
              <User2 className="w-5 h-5 text-violet-600" />
              Your Specialists
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-500">
              Book sessions with your care team
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Milk className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-zinc-800">Lactation Consultant</p>
                  <p className="text-[12px] text-blue-600 font-medium">{motherProfile?.sessionsRemaining?.lactation || 3} sessions remaining</p>
                </div>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-lg text-[12px]" data-testid="button-book-lactation">
                Book
              </Button>
            </div>
            <div className="flex items-center justify-between bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-zinc-800">Physiotherapist</p>
                  <p className="text-[12px] text-green-600 font-medium">{motherProfile?.sessionsRemaining?.physio || 2} sessions remaining</p>
                </div>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-lg text-[12px]" data-testid="button-book-physio">
                Book
              </Button>
            </div>
            <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Apple className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-zinc-800">Nutritionist</p>
                  <p className="text-[12px] text-amber-600 font-medium">{motherProfile?.sessionsRemaining?.nutrition || 4} sessions remaining</p>
                </div>
              </div>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 rounded-lg text-[12px]" data-testid="button-book-nutrition">
                Book
              </Button>
            </div>
            <div className="flex items-center justify-between bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-zinc-800">Mental Wellness Coach</p>
                  <p className="text-[12px] text-purple-600 font-medium">{motherProfile?.sessionsRemaining?.mentalHealth || 5} sessions remaining</p>
                </div>
              </div>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 rounded-lg text-[12px]" data-testid="button-book-mental">
                Book
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSpecialistsModal(false)}
              className="w-full rounded-xl"
              data-testid="button-close-specialists"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Details Modal */}
      <Dialog open={showPlanDetailsModal !== null} onOpenChange={(open) => !open && setShowPlanDetailsModal(null)}>
        <DialogContent className="max-w-[360px] rounded-2xl max-h-[85vh] overflow-y-auto" data-testid="dialog-plan-details">
          <DialogHeader>
            <DialogTitle className={`text-[18px] font-bold flex items-center gap-2 ${
              showPlanDetailsModal === "child" ? "text-violet-700" : "text-pink-700"
            }`}>
              <Crown className={`w-5 h-5 ${showPlanDetailsModal === "child" ? "text-violet-600" : "text-pink-600"}`} />
              Your Plan Benefits
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-500">
              Here's what's included in your plan
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2 space-y-4">
            {showPlanDetailsModal === "child" && childPlanInfo && (
              <>
                <div className={`rounded-xl p-4 ${
                  activePlans.comboPlan ? "bg-gradient-to-r from-violet-50 to-pink-50" : "bg-violet-50"
                }`}>
                  <h4 className="text-[15px] font-bold text-zinc-900 mb-1" data-testid="text-plan-details-name">
                    {childPlanInfo.name}
                  </h4>
                  <p className="text-[13px] text-zinc-600 mb-3">{childPlanInfo.description}</p>
                  
                  {childPlanInfo.isCombo && 'childPart' in childPlanInfo && (
                    <div className="bg-white/80 rounded-lg px-3 py-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-violet-600" />
                        <span className="text-[13px] font-medium text-zinc-700">{childPlanInfo.childPart}</span>
                      </div>
                    </div>
                  )}
                  
                  {'benefits' in childPlanInfo && childPlanInfo.benefits && (
                    <div className="space-y-2">
                      {childPlanInfo.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-[13px] text-zinc-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {showPlanDetailsModal === "mother" && motherPlanInfo && (
              <>
                <div className={`rounded-xl p-4 ${
                  activePlans.comboPlan ? "bg-gradient-to-r from-pink-50 to-violet-50" : "bg-pink-50"
                }`}>
                  <h4 className="text-[15px] font-bold text-zinc-900 mb-1" data-testid="text-plan-details-name">
                    {motherPlanInfo.name}
                  </h4>
                  <p className="text-[13px] text-zinc-600 mb-3">{motherPlanInfo.description}</p>
                  
                  {motherPlanInfo.isCombo && 'motherPart' in motherPlanInfo && (
                    <div className="bg-white/80 rounded-lg px-3 py-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-600" />
                        <span className="text-[13px] font-medium text-zinc-700">{motherPlanInfo.motherPart}</span>
                      </div>
                    </div>
                  )}
                  
                  {'benefits' in motherPlanInfo && motherPlanInfo.benefits && (
                    <div className="space-y-2">
                      {motherPlanInfo.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-[13px] text-zinc-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* For combo plans, show that it covers both */}
            {activePlans.comboPlan && (
              <div className="bg-zinc-50 rounded-xl p-3 text-center">
                <p className="text-[12px] text-zinc-600">
                  <span className="font-semibold">Combo Plan:</span> This plan covers both your baby's care and your wellness.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              onClick={() => setShowPlanDetailsModal(null)}
              className={`w-full rounded-xl ${
                showPlanDetailsModal === "child" 
                  ? "bg-violet-600 hover:bg-violet-700" 
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
              data-testid="button-close-plan-details"
            >
              Got it
            </Button>
            <Link href="/babycare/plans">
              <Button
                variant="outline"
                onClick={() => {
                  clearActivePlans();
                  setShowPlanDetailsModal(null);
                }}
                className="w-full rounded-xl border-zinc-300 text-zinc-600"
                data-testid="button-change-plan"
              >
                Change Plan
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Floating AI Nanny Button - Bottom Right (Baby Tab) */}
      {baby && activeTab === "baby" && (
        <div className="absolute bottom-20 right-4 z-50">
          <Link href={`/babycare/ai-nanny/${baby.id}`} data-testid="link-ai-nanny-floating">
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 hover:from-violet-600 hover:via-purple-600 hover:to-indigo-700 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-2 border-white/30"
              data-testid="button-ai-nanny-fab"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-[13px] font-bold pr-1">AI Nanny</span>
            </button>
          </Link>
        </div>
      )}

      {/* Floating AI Assistant Button - Bottom Right (Mother Tab) */}
      {motherProfile && activeTab === "mother" && hasMotherPlan && (
        <div className="absolute bottom-20 right-4 z-50">
          <Link href="/babycare/ai-chat" data-testid="link-ai-assistant-floating">
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-2 border-white/30"
              data-testid="button-ai-assistant-fab"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-[13px] font-bold pr-1">AI Nanny</span>
            </button>
          </Link>
        </div>
      )}

      {/* Caregiver Pitch Dialog */}
      <Dialog open={showCaregiverPitchModal} onOpenChange={setShowCaregiverPitchModal}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl" data-testid="dialog-caregiver-pitch">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <span className="text-[17px] font-bold text-zinc-900">Your Wellness Matters</span>
                <p className="text-[13px] text-zinc-500 font-normal">Self-care support for caregivers</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2 space-y-4">
            <p className="text-[14px] text-zinc-600 leading-relaxed">
              Add your profile to unlock personalized wellness features designed to support you through this journey.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-pink-50 rounded-xl p-3">
                <Activity className="w-5 h-5 text-pink-600 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-zinc-800">Symptom Tracking</p>
                  <p className="text-[12px] text-zinc-500">Monitor your recovery and wellness</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-3">
                <Smile className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-zinc-800">Mental Wellness</p>
                  <p className="text-[12px] text-zinc-500">Tools for emotional health support</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-zinc-800">Expert Consultations</p>
                  <p className="text-[12px] text-zinc-500">Connect with specialists when needed</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col gap-2">
            <Button
              onClick={handleAddCaregiverProfile}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 rounded-xl"
              data-testid="button-confirm-add-profile"
            >
              Add My Profile
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowCaregiverPitchModal(false)}
              className="w-full text-zinc-500"
              data-testid="button-maybe-later"
            >
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vaccine Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="max-w-[340px] rounded-2xl" data-testid="dialog-vaccine-reminder">
          <DialogHeader>
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-center">
              Set Vaccine Reminder
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-500 text-center">
              {reminderVaccine ? (
                <>Get reminded about <span className="font-semibold text-zinc-700">{reminderVaccine.name}</span></>
              ) : (
                "Choose how and when to be reminded"
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Reminder Type Selection */}
            <div>
              <label className="text-[13px] font-semibold text-zinc-700 mb-2 block">
                How should we remind you?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setReminderType("call")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    reminderType === "call"
                      ? "border-blue-500 bg-blue-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                  data-testid="reminder-type-call"
                >
                  <Phone className={`w-5 h-5 ${reminderType === "call" ? "text-blue-600" : "text-zinc-400"}`} />
                  <span className={`text-[11px] font-medium ${reminderType === "call" ? "text-blue-700" : "text-zinc-600"}`}>
                    Call
                  </span>
                </button>
                <button
                  onClick={() => setReminderType("sms")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    reminderType === "sms"
                      ? "border-blue-500 bg-blue-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                  data-testid="reminder-type-sms"
                >
                  <MessageSquare className={`w-5 h-5 ${reminderType === "sms" ? "text-blue-600" : "text-zinc-400"}`} />
                  <span className={`text-[11px] font-medium ${reminderType === "sms" ? "text-blue-700" : "text-zinc-600"}`}>
                    SMS
                  </span>
                </button>
                <button
                  onClick={() => setReminderType("push")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    reminderType === "push"
                      ? "border-blue-500 bg-blue-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                  data-testid="reminder-type-push"
                >
                  <Bell className={`w-5 h-5 ${reminderType === "push" ? "text-blue-600" : "text-zinc-400"}`} />
                  <span className={`text-[11px] font-medium ${reminderType === "push" ? "text-blue-700" : "text-zinc-600"}`}>
                    Push
                  </span>
                </button>
              </div>
            </div>

            {/* Reminder Time Selection */}
            <div>
              <label className="text-[13px] font-semibold text-zinc-700 mb-2 block">
                When should we remind you?
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setReminderTime("1day")}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    reminderTime === "1day"
                      ? "border-blue-500 bg-blue-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                  data-testid="reminder-time-1day"
                >
                  <span className={`text-[13px] font-medium ${reminderTime === "1day" ? "text-blue-700" : "text-zinc-600"}`}>
                    1 day before due date
                  </span>
                  {reminderTime === "1day" && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
                <button
                  onClick={() => setReminderTime("3days")}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    reminderTime === "3days"
                      ? "border-blue-500 bg-blue-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                  data-testid="reminder-time-3days"
                >
                  <span className={`text-[13px] font-medium ${reminderTime === "3days" ? "text-blue-700" : "text-zinc-600"}`}>
                    3 days before due date
                  </span>
                  {reminderTime === "3days" && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
                <button
                  onClick={() => setReminderTime("1week")}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    reminderTime === "1week"
                      ? "border-blue-500 bg-blue-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                  data-testid="reminder-time-1week"
                >
                  <span className={`text-[13px] font-medium ${reminderTime === "1week" ? "text-blue-700" : "text-zinc-600"}`}>
                    1 week before due date
                  </span>
                  {reminderTime === "1week" && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                {reminderType === "call" 
                  ? "You'll receive an automated call reminder at 10:00 AM on the scheduled day."
                  : reminderType === "sms"
                  ? "You'll receive an SMS reminder with vaccine details and booking link."
                  : "You'll receive a push notification on your device."}
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReminderDialog(false)}
              className="flex-1 rounded-xl h-11"
              data-testid="button-cancel-reminder"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "Reminder set!",
                  description: `You'll receive a ${reminderType === "call" ? "call" : reminderType === "sms" ? "SMS" : "notification"} ${
                    reminderTime === "1day" ? "1 day" : reminderTime === "3days" ? "3 days" : "1 week"
                  } before the vaccine is due.`,
                });
                setShowReminderDialog(false);
                setReminderVaccine(null);
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 rounded-xl h-11 font-semibold shadow-lg"
              data-testid="button-confirm-reminder"
            >
              Set Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
