import { Link, useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Syringe, 
  ChevronRight,
  Plus,
  Calendar,
  RotateCcw,
  Baby,
  Heart,
  Camera,
  Phone,
  Sparkles,
  Bell,
  MessageSquare,
  Check,
  Home,
  HelpCircle,
  Shield,
  TrendingUp,
  FileText,
  Building2,
  AlertCircle,
  Star,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import type { BabyProfile, Vaccine, GrowthEntry } from "@shared/schema";
import { differenceInMonths, differenceInDays, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  getActivePlans, 
  hasChildPlan as checkChildPlan, 
  hasMotherPlan as checkMotherPlan,
  childPlanDetails,
  motherPlanDetails,
  comboPlanDetails,
  type ActivePlans
} from "@/lib/planStore";
import { Crown } from "lucide-react";
import { getCaregiverProfile, type CaregiverProfile } from "@/lib/caregiverStore";
import { MiraFab } from "@/components/MiraFab";

function calculateAge(dob: string): { display: string; months: number } {
  const birthDate = new Date(dob);
  const today = new Date();
  const totalMonths = differenceInMonths(today, birthDate);
  const totalDays = differenceInDays(today, birthDate);
  
  if (totalMonths < 1) {
    return { display: `${totalDays} days`, months: 0 };
  } else if (totalMonths < 12) {
    return { display: `${totalMonths} months`, months: totalMonths };
  } else {
    const years = Math.floor(totalMonths / 12);
    const monthsRemaining = totalMonths % 12;
    return { display: `${years}y ${monthsRemaining}m`, months: totalMonths };
  }
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

export default function BabyCareHome() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCaregiverPitchModal, setShowCaregiverPitchModal] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState<"child" | "mother" | null>(null);
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);
  const [reminderVaccine, setReminderVaccine] = useState<Vaccine | null>(null);
  const [reminderType, setReminderType] = useState<"call" | "sms" | "push">("call");
  const [reminderTime, setReminderTime] = useState<"1day" | "3days" | "1week">("1day");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const babyId = params.babyId;
  
  const [caregiverProfile, setCaregiverProfileState] = useState<CaregiverProfile | null>(null);
  const isCaregiverComplete = caregiverProfile?.setupCompleted === true;
  const [activePlans, setActivePlansState] = useState<ActivePlans>({ childPlan: null, motherPlan: null, comboPlan: null });
  
  useEffect(() => {
    setActivePlansState(getActivePlans());
    setCaregiverProfileState(getCaregiverProfile());
  }, []);
  
  const userHasChildPlan = checkChildPlan(activePlans);
  const userHasMotherPlan = checkMotherPlan(activePlans);

  const getCurrentChildPlanInfo = () => {
    if (activePlans.comboPlan) {
      const combo = comboPlanDetails[activePlans.comboPlan];
      return { name: combo.name, description: combo.shortDescription, isCombo: true };
    }
    if (activePlans.childPlan) {
      const plan = childPlanDetails[activePlans.childPlan];
      return { name: plan.name, description: plan.shortDescription, benefits: plan.benefits, isCombo: false };
    }
    return null;
  };
  
  const getCurrentMotherPlanInfo = () => {
    if (activePlans.comboPlan) {
      const combo = comboPlanDetails[activePlans.comboPlan];
      return { name: combo.name, description: combo.shortDescription, isCombo: true };
    }
    if (activePlans.motherPlan) {
      const plan = motherPlanDetails[activePlans.motherPlan];
      return { name: plan.name, description: plan.shortDescription, benefits: plan.benefits, isCombo: false };
    }
    return null;
  };
  
  const childPlanInfo = getCurrentChildPlanInfo();
  const motherPlanInfo = getCurrentMotherPlanInfo();

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

  const upcomingVaccines = vaccines
    .filter(v => v.status === "pending" && v.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 2);

  const babyAge = baby ? calculateAge(baby.dob) : { display: "", months: 0 };
  
  const latestWeight = growthEntries
    .filter(e => e.type === "weight")
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
  const latestHeight = growthEntries
    .filter(e => e.type === "height")
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];

  const handleAddCaregiverProfile = () => {
    setShowCaregiverPitchModal(false);
    setLocation("/babycare/setup?includeMother=true&returnTo=home");
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleResetApp = () => {
    // Clear all localStorage data
    localStorage.removeItem("nurture_active_plans");
    localStorage.removeItem("nurture_caregiver_profile");
    localStorage.removeItem("nurture_reminders");
    
    toast({
      title: "App Reset Complete",
      description: "All data has been cleared. Redirecting to start fresh...",
    });
    
    // Redirect to home after a brief delay
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  const mockPhotos = baby?.photoUrl ? [baby.photoUrl] : [];

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col relative">
      {/* Dark Header */}
      <div className="bg-zinc-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/10" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center">
              <Baby className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white" data-testid="text-header-title">
                {baby ? baby.name : "Nurture"}
              </h1>
              {baby && (
                <p className="text-[11px] text-zinc-400" data-testid="text-baby-age">
                  {babyAge.display} old
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {(userHasChildPlan || userHasMotherPlan) ? (
              <button
                onClick={() => setShowPlanDetailsModal(userHasChildPlan ? "child" : "mother")}
                className="relative h-9 w-9 flex items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
                data-testid="button-view-plan"
              >
                <Crown className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-zinc-900" />
              </button>
            ) : (
              <Link href="/babycare/plans">
                <button
                  className="relative h-9 w-9 flex items-center justify-center text-zinc-400 hover:bg-white/10 rounded-md border border-dashed border-zinc-600"
                  data-testid="button-explore-plans"
                >
                  <Crown className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full border-2 border-zinc-900 animate-pulse" />
                </button>
              </Link>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-white hover:bg-white/10" 
              data-testid="button-reset"
              onClick={() => setShowResetConfirmDialog(true)}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Memories Section */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-zinc-800">Memories</h2>
            <button 
              onClick={handlePhotoUpload}
              className="flex items-center gap-1 text-[12px] text-violet-600 font-medium"
              data-testid="button-add-photo"
            >
              <Plus className="w-3 h-3" />
              Add Photo
            </button>
          </div>
          
          {mockPhotos.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {mockPhotos.map((photo, idx) => (
                <div 
                  key={idx}
                  className="w-24 h-24 rounded-xl bg-zinc-100 flex-shrink-0 overflow-hidden"
                  data-testid={`photo-memory-${idx}`}
                >
                  <img src={photo} alt="Memory" className="w-full h-full object-cover" />
                </div>
              ))}
              <button 
                onClick={handlePhotoUpload}
                className="w-24 h-24 rounded-xl bg-zinc-100 border-2 border-dashed border-zinc-300 flex-shrink-0 flex flex-col items-center justify-center gap-1"
                data-testid="button-upload-more"
              >
                <Camera className="w-5 h-5 text-zinc-400" />
                <span className="text-[10px] text-zinc-400">Add more</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={handlePhotoUpload}
              className="w-full h-28 rounded-xl bg-gradient-to-br from-violet-50 to-pink-50 border border-dashed border-violet-200 flex flex-col items-center justify-center gap-2"
              data-testid="button-upload-first-photo"
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                <Camera className="w-5 h-5 text-violet-500" />
              </div>
              <span className="text-[12px] text-zinc-600">Capture precious moments</span>
            </button>
          )}
        </div>

        {/* Milestones Hero Card */}
        {baby && (
          <div className="px-4 pb-3">
            <Card className="bg-white border border-zinc-100 shadow-md rounded-2xl overflow-hidden" data-testid="card-milestones-hero">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold text-white">Milestones</h3>
                      <p className="text-[12px] text-white/90">Celebrate every little win</p>
                    </div>
                  </div>
                  <Link href={`/babycare/milestones/${baby.id}`}>
                    <Button size="sm" variant="secondary" className="bg-white/25 hover:bg-white/35 text-white border-0 text-[11px] h-8 font-semibold">
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="p-4">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-7 h-7 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold text-zinc-800">Start tracking your baby's firsts</p>
                        <p className="text-[12px] text-zinc-500 mt-0.5">Every smile, every step matters</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Care Essentials Grid */}
        <div className="px-4 pb-3">
          <h2 className="text-[14px] font-semibold text-zinc-800 mb-3">Care Essentials</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Vaccines Card */}
            {baby && (
              <Link href={`/babycare/vaccines/${baby.id}`}>
                <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-vaccines">
                  <CardContent className="p-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-[14px] font-bold text-zinc-800">Vaccines</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {vaccines.filter(v => v.status === 'completed').length}/{vaccines.length} completed
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Growth Card */}
            {baby && (
              <Link href={`/babycare/growth/${baby.id}`}>
                <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-growth">
                  <CardContent className="p-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-3">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-[14px] font-bold text-zinc-800">Growth</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {latestWeight || latestHeight
                        ? `${latestWeight?.value || '-'}kg, ${latestHeight?.value || '-'}cm`
                        : "Track height & weight"
                      }
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Records Card */}
            {baby && (
              <Link href={`/babycare/records/${baby.id}`}>
                <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-records">
                  <CardContent className="p-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-zinc-500 flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-[14px] font-bold text-zinc-800">Records</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Prescriptions & reports</p>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Talk to Parents Card */}
            {baby && (
              <Link href={`/babycare/community/${baby.id}`}>
                <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-talk-to-parents">
                  <CardContent className="p-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-[14px] font-bold text-zinc-800">Talk to Parents</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Connect with other parents</p>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Nanny Card */}
            {baby && (
              <button
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Nanny services will be available shortly!",
                  });
                }}
                className="text-left w-full"
              >
                <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-nanny">
                  <CardContent className="p-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-3">
                      <Baby className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-[14px] font-bold text-zinc-800">Nanny</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Coming soon</p>
                  </CardContent>
                </Card>
              </button>
            )}
          </div>
        </div>

        {/* Support Card */}
        <div className="px-4 pb-3">
          <Link href="/babycare/resources">
            <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-support">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-bold text-zinc-800">Support</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Book specialists & get help</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Explore Plans Promo - Show when no plan */}
        {!userHasChildPlan && (
          <div className="px-4 pb-3">
            <Link href="/babycare/plans" data-testid="card-explore-plans-promo">
              <Card className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Crown className="w-7 h-7 text-amber-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold text-white mb-1">Unlock Premium Benefits</h3>
                      <p className="text-[12px] text-white/80">Get AaI, expert consultations & more</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/60" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </div>

      {/* Floating Mira Button */}
      <MiraFab babyId={baby?.id} />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 px-6 py-2 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link href="/">
            <button className="flex flex-col items-center gap-1 py-2 px-4" data-testid="nav-home">
              <Home className="w-5 h-5 text-zinc-400" />
              <span className="text-[10px] font-medium text-zinc-400">Home</span>
            </button>
          </Link>
          <button className="flex flex-col items-center gap-1 py-2 px-4" data-testid="nav-nurture">
            <Baby className="w-5 h-5 text-violet-600" />
            <span className="text-[10px] font-semibold text-violet-600">Nurture</span>
          </button>
          <Link href="/babycare/resources">
            <button className="flex flex-col items-center gap-1 py-2 px-4" data-testid="nav-support">
              <HelpCircle className="w-5 h-5 text-zinc-400" />
              <span className="text-[10px] font-medium text-zinc-400">Support</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            toast({
              title: "Photo uploaded!",
              description: "Your memory has been saved.",
            });
          }
        }}
        data-testid="input-photo-upload"
      />

      {/* Caregiver Pitch Modal */}
      <Dialog open={showCaregiverPitchModal} onOpenChange={setShowCaregiverPitchModal}>
        <DialogContent className="max-w-[340px] rounded-2xl" data-testid="dialog-caregiver-pitch">
          <DialogHeader>
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-center">
              Your Wellness Matters
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-500 text-center">
              Add your profile to access postpartum recovery, mental health support, and expert consultations
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-3 bg-pink-50 rounded-xl p-3">
              <Heart className="w-5 h-5 text-pink-600 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-zinc-800">Postpartum Recovery</p>
                <p className="text-[12px] text-zinc-500">Personalized recovery tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-3">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-zinc-800">Mental Wellness</p>
                <p className="text-[12px] text-zinc-500">Support for new mothers</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-zinc-800">Expert Consultations</p>
                <p className="text-[12px] text-zinc-500">Connect with specialists</p>
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
                  {reminderTime === "1day" && <Check className="w-4 h-4 text-blue-600" />}
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
                  {reminderTime === "3days" && <Check className="w-4 h-4 text-blue-600" />}
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
                  {reminderTime === "1week" && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            </div>

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

      {/* Plan Details Modal */}
      <Dialog open={showPlanDetailsModal !== null} onOpenChange={() => setShowPlanDetailsModal(null)}>
        <DialogContent className="max-w-[340px] rounded-2xl" data-testid="dialog-plan-details">
          <DialogHeader>
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-center">
              {showPlanDetailsModal === "child" && childPlanInfo
                ? childPlanInfo.name
                : showPlanDetailsModal === "mother" && motherPlanInfo
                ? motherPlanInfo.name
                : "Your Plan"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-500 text-center">
              {showPlanDetailsModal === "child" && childPlanInfo
                ? childPlanInfo.description
                : showPlanDetailsModal === "mother" && motherPlanInfo
                ? motherPlanInfo.description
                : "Premium care benefits active"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3">
              <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-zinc-800">Plan Active</p>
                <p className="text-[12px] text-zinc-500">Your benefits are ready to use</p>
              </div>
            </div>
            {showPlanDetailsModal === "child" && (
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
                <Baby className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-zinc-800">Baby Care Coverage</p>
                  <p className="text-[12px] text-zinc-500">Vaccines, consultations & more</p>
                </div>
              </div>
            )}
            {showPlanDetailsModal === "mother" && (
              <div className="flex items-center gap-3 bg-pink-50 rounded-xl p-3">
                <Heart className="w-5 h-5 text-pink-600 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-zinc-800">Mother Wellness</p>
                  <p className="text-[12px] text-zinc-500">Recovery & mental health support</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col gap-2">
            <Link href="/babycare/plans" className="w-full">
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl"
                data-testid="button-manage-plans"
              >
                Manage Plans
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => setShowPlanDetailsModal(null)}
              className="w-full text-zinc-500"
              data-testid="button-close-plan-details"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirmDialog} onOpenChange={setShowResetConfirmDialog}>
        <DialogContent className="max-w-[340px] rounded-2xl" data-testid="dialog-reset-confirm">
          <DialogHeader>
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
              <RotateCcw className="w-7 h-7 text-white" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-center">
              Reset App Data?
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-500 text-center">
              This will clear all your saved data including baby profiles, plans, and preferences. You'll need to complete onboarding again.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex flex-col gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={() => {
                setShowResetConfirmDialog(false);
                handleResetApp();
              }}
              className="w-full rounded-xl"
              data-testid="button-confirm-reset"
            >
              Yes, Reset Everything
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowResetConfirmDialog(false)}
              className="w-full text-zinc-500"
              data-testid="button-cancel-reset"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
