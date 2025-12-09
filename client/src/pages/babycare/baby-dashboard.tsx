import { Link, useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Syringe, 
  TrendingUp, 
  Star, 
  ChevronRight,
  FileText,
  Settings,
  Smile,
  Sparkles,
  Crown,
  Shield,
  Heart,
  Users,
  Baby
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { BabyProfile, Vaccine, GrowthEntry, Milestone } from "@shared/schema";
import { differenceInMonths, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  getActivePlans, 
  hasChildPlan as checkChildPlan, 
  childPlanDetails,
  comboPlanDetails,
  type ActivePlans
} from "@/lib/planStore";
import { getUserId } from "@/lib/userId";
import { getProfiles, Profile } from "@/lib/profileApi";

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

export default function BabyDashboard() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const babyId = params.babyId;
  
  const [activePlans, setActivePlansState] = useState<ActivePlans>({ childPlan: null, motherPlan: null, comboPlan: null });
  
  useEffect(() => {
    setActivePlansState(getActivePlans());
  }, []);
  
  const userHasChildPlan = checkChildPlan(activePlans);

  // Fetch profiles from API
  const userId = getUserId();
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: [`/api/v1/profiles/user/${userId}`],
    queryFn: () => getProfiles(),
  });

  // Find baby profile - use profileId for matching (route param is profileId)
  const baby = babyId 
    ? profiles.find(p => p.type === "baby" && p.profileId === babyId)
    : profiles.find(p => p.type === "baby");
  const babyProfileId = baby?.profileId || baby?.id; // Use profileId as babyId for API calls

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

  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;

  const babyAge = baby ? calculateAge(baby.dob as string) : { display: "", months: 0, days: 0 };

  if (!baby) {
    return (
      <div className="app-container bg-zinc-50 min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col relative">
      {/* Gradient Header with Baby Profile */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white px-4 pt-3 pb-5">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/babycare/home">
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

        {/* Baby Profile Hero */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3" data-testid="hero-baby-profile">
          <div className="flex items-center gap-4">
            {/* Large Baby Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/20 border-3 border-white/40 flex items-center justify-center overflow-hidden shadow-lg">
                {baby.imageUrl ? (
                  <img src={baby.imageUrl} alt={baby.name} className="w-full h-full object-cover" data-testid="img-baby-photo" />
                ) : (
                  <Smile className="w-9 h-9 text-white" />
                )}
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            
            {/* Baby Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-[20px] font-bold text-white mb-2 truncate" data-testid="text-baby-name">
                {baby.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-[12px] font-semibold text-white" data-testid="text-baby-age">
                    {babyAge.display} old
                  </span>
                </div>
                {baby.gender && (
                  <div className={`px-2.5 py-1 rounded-full ${baby.gender === 'M' ? 'bg-blue-400/40' : 'bg-pink-400/40'}`}>
                    <span className="text-[11px] font-semibold text-white capitalize">{baby.gender}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Plan Button */}
            {userHasChildPlan ? (
              <Link href="/babycare/plans" data-testid="link-your-plan">
                <div className="flex flex-col items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 transition-colors">
                  <Crown className="w-6 h-6 text-amber-300" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wide">Plan</span>
                </div>
              </Link>
            ) : (
              <Link href="/babycare/plans" data-testid="link-explore-plans">
                <div className="flex flex-col items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 transition-colors">
                  <Crown className="w-6 h-6 text-amber-300" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wide">Plan</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3">
        {/* Explore Plans Card - Show first when no plan */}
        {!userHasChildPlan && (
          <Link href="/babycare/plans" data-testid="card-explore-plans-promo">
            <Card className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 border-0 shadow-lg rounded-2xl overflow-hidden mb-3">
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
        )}

        {/* Milestones Hero Card - Happy & Positive Vibe */}
        <Card className="bg-white border border-zinc-100 shadow-md rounded-2xl overflow-hidden mb-3" data-testid="card-milestones-hero">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-white">Milestones</h3>
                  <p className="text-[12px] text-white/90">
                    Celebrate every little win
                  </p>
                </div>
              </div>
              <Link href={`/babycare/milestones/${babyProfileId}`} data-testid="link-milestones-view-all">
                <Button size="sm" variant="secondary" className="bg-white/25 hover:bg-white/35 text-white border-0 text-[11px] h-8 font-semibold">
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-[13px] font-semibold text-zinc-700">Your journey so far</span>
                </div>
                {totalMilestones > 0 && (
                  <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">
                    {completedMilestones} of {totalMilestones}
                  </Badge>
                )}
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-zinc-800">
                      {completedMilestones > 0 
                        ? `${completedMilestones} precious moments captured!`
                        : "Start tracking your baby's firsts"
                      }
                    </p>
                    <p className="text-[12px] text-zinc-500 mt-0.5">
                      {completedMilestones > 0 
                        ? "Every step is worth celebrating"
                        : "Every smile, every step matters"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Grid - 2x3 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Vaccines Card - Now smaller */}
          <Link href={`/babycare/vaccines/${babyProfileId}`}>
            <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-vaccines">
              <CardContent className="p-4 relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-zinc-800">Vaccines</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Track immunizations</p>
                {vaccines.length > 0 && (
                  <Badge variant="secondary" className="absolute top-3 right-3 text-[10px]">
                    {vaccines.filter(v => v.status === 'completed').length}/{vaccines.length}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Growth Card */}
          <Link href={`/babycare/growth/${babyProfileId}`}>
            <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-growth">
              <CardContent className="p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-zinc-800">Growth</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Track height & weight</p>
              </CardContent>
            </Card>
          </Link>

          {/* Talk to Parents Card */}
          <Link href={`/babycare/community/${babyProfileId}`}>
            <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-talk-to-parents">
              <CardContent className="p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-zinc-800">Talk to Parents</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Connect & share</p>
              </CardContent>
            </Card>
          </Link>

          {/* Nanny Card */}
          <button 
            onClick={() => toast({ title: "Coming Soon", description: "Nanny feature is being prepared for you!" })}
            className="text-left w-full"
            data-testid="card-nanny"
          >
            <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate h-full">
              <CardContent className="p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-3">
                  <Baby className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-zinc-800">Nanny</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Care support</p>
              </CardContent>
            </Card>
          </button>

          {/* Records Card */}
          <Link href={`/babycare/records/${babyProfileId}`}>
            <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-records">
              <CardContent className="p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-zinc-500 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-zinc-800">Records</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Health docs</p>
              </CardContent>
            </Card>
          </Link>

          {/* Wellness Plans Card */}
          <Link href="/babycare/plans">
            <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-wellness-plans">
              <CardContent className="p-4 relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-zinc-800">Plans</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">AaI & more</p>
                {!userHasChildPlan && (
                  <span className="text-[11px] text-violet-600 font-semibold mt-1 block">Explore</span>
                )}
                {userHasChildPlan && (
                  <span className="absolute top-3 right-3 w-3 h-3 bg-emerald-400 rounded-full" />
                )}
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Floating Mira Button */}
      <Link href={`/babycare/mira/${babyProfileId}`}>
        <button 
          className="fixed bottom-6 right-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
          data-testid="button-mira"
        >
          <Heart className="w-5 h-5" />
          <span className="text-[13px] font-semibold">Ask AaI</span>
        </button>
      </Link>
    </div>
  );
}
