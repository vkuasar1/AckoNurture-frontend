import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Heart,
  Settings,
  Baby,
  ChevronRight,
  Users,
  Brain,
  BookOpen,
  FileText,
  Crown,
  Sparkle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { BabyProfile } from "@shared/schema";
import { 
  getActivePlans, 
  hasMotherPlan as checkMotherPlan,
  type ActivePlans
} from "@/lib/planStore";
import { getCaregiverProfile, type CaregiverProfile } from "@/lib/caregiverStore";

export default function MotherDashboard() {
  const [, setLocation] = useLocation();
  
  const [caregiverProfile, setCaregiverProfileState] = useState<CaregiverProfile | null>(null);
  const [activePlans, setActivePlansState] = useState<ActivePlans>({ childPlan: null, motherPlan: null, comboPlan: null });
  
  useEffect(() => {
    setActivePlansState(getActivePlans());
    setCaregiverProfileState(getCaregiverProfile());
  }, []);
  
  const userHasMotherPlan = checkMotherPlan(activePlans);
  const isCaregiverComplete = caregiverProfile?.setupCompleted === true;

  const { data: profiles = [] } = useQuery<BabyProfile[]>({
    queryKey: ["/api/baby-profiles"],
  });

  const baby = profiles[0];

  const motherProfile = isCaregiverComplete && caregiverProfile ? {
    name: caregiverProfile.name,
    weeksPostpartum: caregiverProfile.weeksPostpartum || 0,
  } : { name: "Mom", weeksPostpartum: 8 };

  const getRecoveryFocus = (weeks: number) => {
    if (weeks <= 2) return { title: "Rest & healing", description: "Focus on rest, gentle movement, and bonding with baby." };
    if (weeks <= 4) return { title: "Core reconnection", description: "Start gentle breathing exercises and pelvic floor awareness." };
    if (weeks <= 6) return { title: "Building strength", description: "Light walking and continued core exercises when cleared." };
    if (weeks <= 8) return { title: "Core strengthening & pelvic floor", description: "Gentle exercises to rebuild your core muscles after delivery." };
    if (weeks <= 12) return { title: "Active recovery", description: "Gradually increase activity with proper form and support." };
    return { title: "Continued wellness", description: "Maintain your progress and address any ongoing concerns." };
  };

  const recoveryFocus = getRecoveryFocus(motherProfile.weeksPostpartum);

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col relative">
      {/* Gradient Header with Mother Profile */}
      <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white px-4 pt-3 pb-5">
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

        {/* Mother Profile Hero */}
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
              <h2 className="text-[20px] font-bold text-white mb-2 truncate" data-testid="text-mother-name">
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
            <Link href="/babycare/plans" data-testid="link-plans">
              <div className="flex flex-col items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 transition-colors">
                <Crown className="w-6 h-6 text-amber-300" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">Plan</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex gap-2">
          {baby && (
            <Link href={`/babycare/dashboard/${baby.id}`}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white/80 hover:bg-white/25" data-testid="tile-baby">
                <Baby className="w-4 h-4" />
                <span className="text-[13px] font-semibold">{baby.name}</span>
              </div>
            </Link>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-pink-700 shadow-md" data-testid="tile-mother-active">
            <Heart className="w-4 h-4" />
            <span className="text-[13px] font-semibold">{motherProfile.name}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3">
        {/* Your Recovery Card */}
        <Card className="bg-gradient-to-r from-rose-500 to-pink-600 border-0 shadow-lg rounded-2xl overflow-hidden mb-3" data-testid="card-recovery">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white">Your Recovery</h3>
                  <p className="text-[12px] text-white/80">Week {motherProfile.weeksPostpartum} focus</p>
                </div>
              </div>
              <Link href="/babycare/resources">
                <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 text-[11px] h-8">
                  View Tips <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <h4 className="text-[15px] font-bold text-white mb-1">{recoveryFocus.title}</h4>
              <p className="text-[13px] text-white/90">{recoveryFocus.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Specialists Card */}
          <Link href="/babycare/resources">
            <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-specialists">
              <CardContent className="p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-[14px] font-bold text-zinc-800">Specialists</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Lactation, physio & more</p>
                {userHasMotherPlan && (
                  <span className="text-[11px] text-pink-600 font-semibold mt-1 block">5 sessions</span>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Mental Health Card */}
          <Link href="/babycare/mental-wellness">
            <Card className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-mental-health">
              <CardContent className="p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center mb-3">
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-[14px] font-bold text-zinc-800">Mental Health</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Mood & wellness tracking</p>
                <span className="text-[11px] text-purple-600 font-semibold mt-1 block">Track mood</span>
              </CardContent>
            </Card>
          </Link>

          {/* Resources Card */}
          <Link href="/babycare/resources">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-resources">
              <CardContent className="p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-zinc-800">Resources</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Exercise, diet & wellness</p>
                <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Explore</span>
              </CardContent>
            </Card>
          </Link>

          {/* Records Card */}
          <Link href="/babycare/mother-records">
            <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 shadow-sm rounded-xl overflow-hidden hover-elevate" data-testid="card-records">
              <CardContent className="p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-zinc-800">Records</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Health history & docs</p>
                <span className="text-[11px] text-pink-600 font-semibold mt-1 block">View all</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Floating AI Nanny Button */}
      <Link href="/babycare/mother-ai-chat">
        <button 
          className="fixed bottom-6 right-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
          data-testid="button-ai-nanny"
        >
          <Baby className="w-5 h-5" />
          <span className="text-[13px] font-semibold">AI Nanny</span>
        </button>
      </Link>
    </div>
  );
}
