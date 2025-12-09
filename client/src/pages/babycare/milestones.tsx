import { useState, useRef } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  Heart,
  Camera,
  Check,
  Award,
  Upload,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  Calendar,
  Sparkles,
  Star,
  Clock,
  Stethoscope,
  Image as ImageIcon,
  Zap,
  Timer,
  Trophy,
  TrendingUp,
  Syringe,
  Users,
  ChevronRight,
  Baby,
  Cake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type {
  BabyProfile,
  MilestoneProgress,
  MilestoneMemory,
} from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { getProfiles, type Profile } from "@/lib/profileApi";
import { getUserId } from "@/lib/userId";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { differenceInWeeks } from "date-fns";
import { MiraFab } from "@/components/MiraFab";
import {
  MILESTONE_DEFINITIONS,
  MilestoneDefinition,
  getTimingStatus,
} from "@/data/milestoneDefinitions";

type TabType = "now" | "soon" | "done";
type ModalStep =
  | "detail"
  | "noticed_date"
  | "noticed_photo"
  | "not_seen"
  | "celebration";

export default function BabyCareMilestones() {
  const params = useParams();
  const babyId = params.babyId;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>("now");
  const [expanded, setExpanded] = useState(false);
  const [lateExpanded, setLateExpanded] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>("detail");
  const [selectedMilestone, setSelectedMilestone] =
    useState<MilestoneDefinition | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [photoUrl, setPhotoUrl] = useState("");
  const [celebrationData, setCelebrationData] = useState<{
    name: string;
    badge?: string;
    badgeCopy?: string;
    isEarly?: boolean;
  } | null>(null);

  // Fetch profiles from API
  const userId = getUserId();
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: [`/api/v1/profiles/user/${userId}`],
    queryFn: () => getProfiles(),
  });

  // Find baby profile - route param babyId is actually profileId
  const baby = profiles.find(
    (p) => p.type === "baby" && p.profileId === babyId,
  );
  const babyProfileId = baby?.profileId || babyId; // Use profileId for navigation

  const { data: progressData = [] } = useQuery<MilestoneProgress[]>({
    queryKey: ["/api/baby-profiles", babyId, "milestone-progress"],
    enabled: !!babyId,
  });

  const { data: memories = [] } = useQuery<MilestoneMemory[]>({
    queryKey: ["/api/baby-profiles", babyId, "memories"],
    enabled: !!babyId,
  });

  const babyAgeWeeks =
    baby && baby.dob ? differenceInWeeks(new Date(), new Date(baby.dob)) : 0;
  const progressMap = new Map(progressData.map((p) => [p.milestoneDefId, p]));

  const allMilestones = [...MILESTONE_DEFINITIONS].sort(
    (a, b) => a.typicalWeek - b.typicalWeek,
  );

  const lateMilestones = allMilestones.filter((m) => {
    const isCompleted = progressMap.get(m.id)?.completed;
    if (isCompleted) return false;
    return babyAgeWeeks >= m.lateStartWeek;
  });

  const nowMilestones = allMilestones.filter((m) => {
    const isCompleted = progressMap.get(m.id)?.completed;
    if (isCompleted) return false;
    const isLate = babyAgeWeeks >= m.lateStartWeek;
    if (isLate) return false;
    return m.typicalWeek >= babyAgeWeeks && m.typicalWeek <= babyAgeWeeks + 2;
  });

  const soonMilestones = allMilestones.filter((m) => {
    const isCompleted = progressMap.get(m.id)?.completed;
    if (isCompleted) return false;
    const isLate = babyAgeWeeks >= m.lateStartWeek;
    if (isLate) return false;
    return m.typicalWeek > babyAgeWeeks + 2;
  });

  const doneMilestones = allMilestones.filter(
    (m) => progressMap.get(m.id)?.completed,
  );

  const getTabMilestones = () => {
    switch (activeTab) {
      case "now":
        return nowMilestones;
      case "soon":
        return soonMilestones;
      case "done":
        return doneMilestones;
    }
  };

  const currentMilestones = getTabMilestones();
  const displayedMilestones = expanded
    ? currentMilestones
    : currentMilestones.slice(0, 6);
  const hasMore = currentMilestones.length > 6;

  const displayedLateMilestones = lateExpanded
    ? lateMilestones
    : lateMilestones.slice(0, 4);
  const hasMoreLate = lateMilestones.length > 4;

  const saveMilestoneProgress = useMutation({
    mutationFn: async (data: {
      milestoneDefId: string;
      completed: boolean;
      completedWeek: number | null;
      timingStatus: string | null;
      badgeAwarded: boolean;
      badgeName: string | null;
      completedAt: string | null;
    }) => {
      const response = await apiRequest(
        "POST",
        `/api/baby-profiles/${babyId}/milestone-progress`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/baby-profiles", babyId, "milestone-progress"],
      });
    },
  });

  const createMemory = useMutation({
    mutationFn: async (data: {
      milestoneId: string;
      photoUrl: string;
      caption: string;
      takenAt: string;
    }) => {
      const response = await apiRequest(
        "POST",
        `/api/baby-profiles/${babyId}/memories`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/baby-profiles", babyId, "memories"],
      });
      toast({ title: "Memory saved!" });
    },
  });

  const handleChipTap = (milestone: MilestoneDefinition) => {
    setSelectedMilestone(milestone);
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setPhotoUrl("");

    const progress = progressMap.get(milestone.id);
    if (progress?.completed) {
      setModalStep("celebration");
      const status = progress.timingStatus as string;
      let badge = progress.badgeName || undefined;
      let badgeCopy = "";
      let isEarly = status === "early";

      if (isEarly && milestone.earlyBadgeCopy) {
        badgeCopy = milestone.earlyBadgeCopy;
      } else if (milestone.normalBadgeCopy) {
        badgeCopy = milestone.normalBadgeCopy;
      }

      setCelebrationData({ name: milestone.name, badge, badgeCopy, isEarly });
    } else {
      setModalStep("detail");
    }
    setDetailModalOpen(true);
  };

  const handleNoticedThis = () => {
    setModalStep("noticed_date");
  };

  const handleNotSeenYet = () => {
    setModalStep("not_seen");
  };

  const handleConfirmDate = () => {
    setModalStep("noticed_photo");
  };

  const handleSaveMilestone = async (skipPhoto: boolean = false) => {
    if (!selectedMilestone) return;

    const observedWeek = differenceInWeeks(new Date(), new Date(selectedDate));
    const status = getTimingStatus(observedWeek, selectedMilestone, true);
    let badgeName: string | null = null;
    let badgeCopy = "";
    let badgeAwarded = false;
    let isEarly = status === "early";

    if (status === "early" && selectedMilestone.earlyBadgeName) {
      badgeName = selectedMilestone.earlyBadgeName;
      badgeCopy = selectedMilestone.earlyBadgeCopy;
      badgeAwarded = true;
    } else if (status === "normal" && selectedMilestone.normalBadgeName) {
      badgeName = selectedMilestone.normalBadgeName;
      badgeCopy = selectedMilestone.normalBadgeCopy;
      badgeAwarded = true;
    }

    await saveMilestoneProgress.mutateAsync({
      milestoneDefId: selectedMilestone.id,
      completed: true,
      completedWeek: observedWeek,
      timingStatus: status,
      badgeAwarded,
      badgeName,
      completedAt: new Date(selectedDate).toISOString(),
    });

    if (!skipPhoto && photoUrl) {
      await createMemory.mutateAsync({
        milestoneId: selectedMilestone.id,
        photoUrl,
        caption: "",
        takenAt: selectedDate,
      });
    }

    setCelebrationData({
      name: selectedMilestone.name,
      badge: badgeName || undefined,
      badgeCopy,
      isEarly,
    });
    setModalStep("celebration");
  };

  const compressImage = (
    file: File,
    maxWidth: number = 800,
    quality: number = 0.7,
  ): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedUrl = await compressImage(file);
      setPhotoUrl(compressedUrl);
    }
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setModalStep("detail");
    setSelectedMilestone(null);
    setPhotoUrl("");
  };

  const getNotSeenMessage = () => {
    if (!selectedMilestone)
      return { title: "", message: "", showDoctor: false };

    const isLate = babyAgeWeeks >= selectedMilestone.lateStartWeek;
    const isRedFlag = babyAgeWeeks >= selectedMilestone.redFlagWeek;

    if (isRedFlag) {
      return {
        title: "Let's check in with a doctor",
        message: selectedMilestone.redFlagParentCopy,
        showDoctor: true,
      };
    } else if (isLate) {
      return {
        title: "No worries, every baby is different",
        message: selectedMilestone.lateParentCopy,
        showDoctor: true,
      };
    } else {
      return {
        title: "That's perfectly fine!",
        message: `This milestone typically appears around week ${selectedMilestone.typicalWeek}. Your baby is at week ${babyAgeWeeks}, so there's plenty of time. Keep playing and connecting - you're doing great!`,
        showDoctor: false,
      };
    }
  };

  if (!baby) {
    return (
      <div className="app-container min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500">Baby not found</p>
      </div>
    );
  }

  const tabs: {
    key: TabType;
    label: string;
    count: number;
    icon: typeof Zap;
  }[] = [
    { key: "now", label: "Now", count: nowMilestones.length, icon: Zap },
    { key: "soon", label: "Soon", count: soonMilestones.length, icon: Timer },
    { key: "done", label: "Done", count: doneMilestones.length, icon: Trophy },
  ];

  const MilestoneChip = ({
    milestone,
    isLate = false,
  }: {
    milestone: MilestoneDefinition;
    isLate?: boolean;
  }) => {
    const progress = progressMap.get(milestone.id);
    const isCompleted = progress?.completed;

    return (
      <button
        onClick={() => handleChipTap(milestone)}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium transition-all border ${
          isCompleted
            ? "bg-purple-100 border-purple-300 text-purple-700"
            : isLate
              ? "bg-amber-50 border-amber-300 text-amber-700"
              : "bg-white border-zinc-200 text-zinc-600"
        }`}
        data-testid={`chip-${milestone.id}`}
      >
        {isCompleted && <Check className="w-3.5 h-3.5" />}
        {milestone.name}
      </button>
    );
  };

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col">
      {/* Combined Header with Baby Profile */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white px-4 pt-4 pb-5">
        <div className="flex items-start gap-3">
          <Link href={`/babycare/home/${babyProfileId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full mt-1"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <Baby className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-[18px] font-bold">{baby.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1 text-[12px] text-purple-200">
                <Cake className="w-3.5 h-3.5" />
                <span>Week {babyAgeWeeks}</span>
              </div>
              <span className="text-purple-300">|</span>
              <span className="text-[12px] text-purple-200 capitalize">
                {baby.gender}
              </span>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur text-white rounded-full text-[10px] font-medium">
                <Trophy className="w-3 h-3" />
                {doneMilestones.length} Milestones
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur text-white rounded-full text-[10px] font-medium">
                <Award className="w-3 h-3" />
                {progressData.filter((p) => p.badgeAwarded).length} Badges
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur text-white rounded-full text-[10px] font-medium">
                <Camera className="w-3 h-3" />
                {memories.length} Memories
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Welcome Context Section */}
        <div className="px-4 pt-4 pb-2">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <p className="text-[12px] text-zinc-600 leading-relaxed flex items-center gap-2 flex-wrap">
                <span>Your baby's weekly journey—</span>
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-purple-500" />
                  track progress,
                </span>
                <span className="inline-flex items-center gap-1">
                  <Camera className="w-3 h-3 text-pink-500" />
                  log moments,
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500" />
                  enjoy each milestone
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Memories Carousel */}
        {memories.length > 0 && (
          <div className="px-4 pt-2 pb-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-semibold text-zinc-700">
                Recent Memories
              </p>
              <button className="text-[11px] text-purple-600 font-medium">
                View all
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {memories.slice(0, 5).map((memory) => (
                <div
                  key={memory.id}
                  className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-purple-100"
                >
                  <img
                    src={memory.photoUrl}
                    alt="Memory"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <button className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-purple-200 flex items-center justify-center bg-purple-50/50">
                <Camera className="w-5 h-5 text-purple-400" />
              </button>
            </div>
          </div>
        )}

        <div className="px-4 pt-2 pb-1">
          <p className="text-[13px] font-semibold text-zinc-700">
            Celebrate Today's Moments
          </p>
        </div>

        <div className="bg-white border-b border-zinc-100 px-4 py-2 sticky top-0 z-10">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setExpanded(false);
                  }}
                  className={`flex-1 py-2 px-2 rounded-lg text-[12px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.key
                      ? "bg-purple-600 text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                  data-testid={`tab-${tab.key}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4">
          <Card className="border-purple-100 bg-purple-50/30">
            <CardContent className="p-4">
              {currentMilestones.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[13px] text-zinc-400">
                    No milestones here
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {displayedMilestones.map((milestone) => (
                      <MilestoneChip key={milestone.id} milestone={milestone} />
                    ))}
                  </div>

                  {hasMore && (
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="flex items-center gap-1 mx-auto mt-4 text-[12px] text-purple-600 font-medium"
                      data-testid="toggle-expand"
                    >
                      {expanded ? (
                        <>
                          Show less <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          +{currentMilestones.length - 6} more{" "}
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {lateMilestones.length > 0 && (
          <div className="px-4 pb-4">
            <p className="text-[13px] font-semibold text-zinc-700 mb-3">
              Taking a Little Longer
            </p>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <p className="text-[13px] font-semibold text-amber-800">
                    Yet to show up ({lateMilestones.length})
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {displayedLateMilestones.map((milestone) => (
                    <MilestoneChip
                      key={milestone.id}
                      milestone={milestone}
                      isLate
                    />
                  ))}
                </div>

                {hasMoreLate && (
                  <button
                    onClick={() => setLateExpanded(!lateExpanded)}
                    className="flex items-center gap-1 mt-3 text-[11px] text-amber-700 font-medium"
                    data-testid="toggle-late-expand"
                  >
                    {lateExpanded ? (
                      <>
                        Show less <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        +{lateMilestones.length - 4} more{" "}
                        <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <p className="text-[13px] font-semibold text-zinc-700 mb-3">
            Quick Actions
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Link href={`/babycare/growth/${babyProfileId}`}>
              <Card className="border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all cursor-pointer">
                <CardContent className="p-3 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 text-center">
                    Growth
                  </span>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/babycare/vaccines/${babyProfileId}`}>
              <Card className="border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer">
                <CardContent className="p-3 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Syringe className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-blue-700 text-center">
                    Vaccines
                  </span>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/babycare/community/${babyId}`}>
              <Card
                className="border-orange-200 bg-orange-50 hover:bg-orange-100 transition-all cursor-pointer"
                data-testid="button-parent-connect"
              >
                <CardContent className="p-3 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-orange-700 text-center">
                    Parent Connect
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Encouragement Card */}
        <div className="px-4 pb-4">
          <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-zinc-800">
                  You're doing great!
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Every milestone is unique. Keep celebrating the little moments
                  with {baby.name}.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </CardContent>
          </Card>
        </div>

        <div className="h-24" />
      </div>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-[320px] rounded-3xl p-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {modalStep === "detail" && selectedMilestone && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
                  data-testid="button-close-modal"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-7 h-7 text-purple-500" />
                  </div>
                  <h2 className="text-[18px] font-bold text-zinc-900 mb-2">
                    {selectedMilestone.name}
                  </h2>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">
                    {selectedMilestone.description}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-2">
                    Typical: Week {selectedMilestone.typicalWeek}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleNoticedThis}
                    className="w-full rounded-xl h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
                    data-testid="button-noticed-this"
                  >
                    <Check className="w-4 h-4 mr-2" />I have noticed this
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleNotSeenYet}
                    className="w-full rounded-xl h-12 border-zinc-200 text-zinc-600 font-medium"
                    data-testid="button-not-seen"
                  >
                    <Clock className="w-4 h-4 mr-2" />I have not yet seen this
                  </Button>
                </div>
              </motion.div>
            )}

            {modalStep === "noticed_date" && selectedMilestone && (
              <motion.div
                key="noticed_date"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <button
                  onClick={() => setModalStep("detail")}
                  className="absolute top-4 left-4 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
                  data-testid="button-back-to-detail"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-500" />
                </button>

                <div className="text-center mb-4 pt-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-purple-500" />
                  </div>
                  <h2 className="text-[17px] font-bold text-zinc-900 mb-1">
                    Record this milestone
                  </h2>
                  <p className="text-[12px] text-zinc-500">
                    {selectedMilestone.name}
                  </p>
                </div>

                <div className="mb-4">
                  <Label
                    htmlFor="observedDate"
                    className="text-[11px] text-zinc-500 mb-1.5 block"
                  >
                    When did you notice?
                  </Label>
                  <Input
                    id="observedDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="h-11 rounded-xl text-center text-[14px]"
                    data-testid="input-observed-date"
                  />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="input-photo-file"
                />

                <div className="mb-4">
                  <Label className="text-[11px] text-zinc-500 mb-1.5 block">
                    Add a photo (optional)
                  </Label>
                  {photoUrl ? (
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => setPhotoUrl("")}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
                        data-testid="button-remove-photo"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-zinc-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all"
                      data-testid="button-add-photo"
                    >
                      <Camera className="w-5 h-5 text-zinc-400" />
                      <span className="text-[12px] text-zinc-500">
                        Take or upload photo
                      </span>
                    </button>
                  )}
                </div>

                <Button
                  onClick={() => handleSaveMilestone(false)}
                  disabled={saveMilestoneProgress.isPending}
                  className="w-full rounded-xl h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
                  data-testid="button-save-milestone"
                >
                  {saveMilestoneProgress.isPending
                    ? "Saving..."
                    : "Save Milestone"}
                </Button>
              </motion.div>
            )}

            {modalStep === "not_seen" && selectedMilestone && (
              <motion.div
                key="not_seen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <button
                  onClick={() => setModalStep("detail")}
                  className="absolute top-4 left-4 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
                  data-testid="button-back-from-not-seen"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-500" />
                </button>

                {(() => {
                  const { title, message, showDoctor } = getNotSeenMessage();
                  const isRedFlag =
                    babyAgeWeeks >= selectedMilestone.redFlagWeek;

                  return (
                    <div className="pt-4">
                      <div className="text-center mb-6">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            isRedFlag
                              ? "bg-gradient-to-br from-amber-100 to-orange-100"
                              : "bg-gradient-to-br from-emerald-100 to-teal-100"
                          }`}
                        >
                          {isRedFlag ? (
                            <AlertCircle className="w-7 h-7 text-amber-500" />
                          ) : (
                            <Heart className="w-7 h-7 text-emerald-500" />
                          )}
                        </div>
                        <h2 className="text-[18px] font-bold text-zinc-900 mb-3">
                          {title}
                        </h2>
                        <p className="text-[13px] text-zinc-500 leading-relaxed">
                          {message}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {showDoctor && (
                          <Link href="/consult-doctor?specialty=pediatrician">
                            <Button
                              variant="outline"
                              className="w-full rounded-xl h-12 border-purple-200 text-purple-600 font-medium"
                              data-testid="button-consult-doctor"
                            >
                              <Stethoscope className="w-4 h-4 mr-2" />
                              Consult a pediatrician
                            </Button>
                          </Link>
                        )}

                        <Link href={`/babycare/community/${babyProfileId}`}>
                          <Button
                            variant="outline"
                            className="w-full rounded-xl h-12 border-orange-200 text-orange-600 font-medium"
                            data-testid="button-talk-parents"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Talk to other parents
                          </Button>
                        </Link>

                        <Button
                          onClick={handleCloseModal}
                          className="w-full rounded-xl h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium"
                          data-testid="button-got-it"
                        >
                          Got it, thanks!
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {modalStep === "celebration" && celebrationData && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-6 text-center"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
                  >
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        celebrationData.isEarly
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200"
                          : "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-200"
                      }`}
                    >
                      {celebrationData.isEarly ? (
                        <Award className="w-10 h-10 text-white" />
                      ) : (
                        <Heart className="w-10 h-10 text-white" />
                      )}
                    </div>
                  </motion.div>

                  {celebrationData.isEarly && (
                    <>
                      <motion.div
                        className="absolute top-0 left-1/4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </motion.div>
                      <motion.div
                        className="absolute top-2 right-1/4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Star className="w-4 h-4 text-pink-400 fill-pink-400" />
                      </motion.div>
                      <motion.div
                        className="absolute top-8 right-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </motion.div>
                    </>
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2
                    className={`text-[22px] font-bold mb-2 ${
                      celebrationData.isEarly
                        ? "text-amber-600"
                        : "text-purple-600"
                    }`}
                  >
                    {celebrationData.isEarly ? "Amazing!" : "Wonderful!"}
                  </h2>
                  <p className="text-[15px] font-medium text-zinc-800 mb-1">
                    {celebrationData.name}
                  </p>

                  {celebrationData.badge && (
                    <motion.div
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full mt-3 mb-2 ${
                        celebrationData.isEarly
                          ? "bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200"
                          : "bg-purple-100 border border-purple-200"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.4 }}
                    >
                      <Award
                        className={`w-4 h-4 ${celebrationData.isEarly ? "text-amber-600" : "text-purple-600"}`}
                      />
                      <span
                        className={`text-[13px] font-semibold ${celebrationData.isEarly ? "text-amber-700" : "text-purple-700"}`}
                      >
                        {celebrationData.badge}
                      </span>
                    </motion.div>
                  )}

                  {celebrationData.badgeCopy && (
                    <p className="text-[13px] text-zinc-500 mt-3 leading-relaxed max-w-[240px] mx-auto">
                      {celebrationData.badgeCopy}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                >
                  <Button
                    onClick={handleCloseModal}
                    className={`w-full rounded-xl h-12 font-medium ${
                      celebrationData.isEarly
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    } text-white`}
                    data-testid="button-close-celebration"
                  >
                    Continue
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <MiraFab babyId={babyProfileId} />
    </div>
  );
}
