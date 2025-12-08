import { useState } from "react";
import { Link, useParams } from "wouter";
import { 
  ArrowLeft, 
  Heart,
  Camera,
  MessageCircle,
  Sparkles,
  Check,
  Star,
  PartyPopper,
  Baby,
  Smile,
  Hand,
  Eye,
  Ear,
  Footprints,
  Brain,
  MessageSquare,
  Gift,
  Sun,
  Moon,
  Cloud,
  ImageIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BabyProfile, Milestone, MilestoneMemory } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format, differenceInMonths } from "date-fns";

const AGE_FILTERS = [
  { id: "all", label: "All", icon: Star },
  { id: "0-3 Months", label: "0-3m", icon: Baby },
  { id: "4-6 Months", label: "3-6m", icon: Smile },
  { id: "7-9 Months", label: "6-9m", icon: Hand },
  { id: "10-12 Months", label: "9-12m", icon: Footprints },
  { id: "1-2 Years", label: "1-2y", icon: Brain },
];

const celebrationMessages = [
  "Every smile, every step - a treasure!",
  "These moments become forever memories",
  "Celebrating the little wonders",
  "Your baby's journey is magical",
  "Cherish every precious milestone"
];

const getMilestoneIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('smile') || lower.includes('laugh')) return Smile;
  if (lower.includes('hand') || lower.includes('reach') || lower.includes('grasp')) return Hand;
  if (lower.includes('eye') || lower.includes('follow') || lower.includes('see')) return Eye;
  if (lower.includes('sound') || lower.includes('hear') || lower.includes('voice')) return Ear;
  if (lower.includes('walk') || lower.includes('step') || lower.includes('stand') || lower.includes('crawl')) return Footprints;
  if (lower.includes('word') || lower.includes('talk') || lower.includes('say') || lower.includes('babble')) return MessageSquare;
  return Star;
};

const getMilestoneGradient = (index: number) => {
  const gradients = [
    "from-pink-400 to-rose-500",
    "from-violet-400 to-purple-500",
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-cyan-400 to-blue-500",
  ];
  return gradients[index % gradients.length];
};

export default function BabyCareMilestones() {
  const params = useParams();
  const babyId = params.babyId;
  const { toast } = useToast();
  const [selectedAge, setSelectedAge] = useState("all");
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [takenAt, setTakenAt] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: profiles = [] } = useQuery<BabyProfile[]>({
    queryKey: ["/api/baby-profiles"],
  });

  const baby = profiles.find(p => p.id === babyId);

  const { data: milestones = [], isLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/baby-profiles", babyId, "milestones"],
    enabled: !!babyId,
  });

  const { data: memories = [] } = useQuery<MilestoneMemory[]>({
    queryKey: ["/api/baby-profiles", babyId, "memories"],
    enabled: !!babyId,
  });

  const updateMilestone = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/milestones/${id}`, {
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/baby-profiles", babyId, "milestones"] });
      if (variables.completed) {
        toast({
          title: "What a magical moment!",
          description: "This milestone has been celebrated!",
        });
      }
    },
  });

  const createMemory = useMutation({
    mutationFn: async (data: { milestoneId: string; photoUrl: string; caption: string; takenAt: string }) => {
      const response = await apiRequest("POST", `/api/baby-profiles/${babyId}/memories`, {
        milestoneId: data.milestoneId,
        photoUrl: data.photoUrl,
        caption: data.caption,
        takenAt: new Date(data.takenAt).toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/baby-profiles", babyId, "memories"] });
      setPhotoModalOpen(false);
      setPhotoUrl("");
      setCaption("");
      setTakenAt(format(new Date(), "yyyy-MM-dd"));
      toast({
        title: "Memory captured!",
        description: "This beautiful moment is now part of your memory lane.",
      });
    },
  });

  const filteredMilestones = selectedAge === "all" 
    ? milestones 
    : milestones.filter(m => m.ageGroup === selectedAge);

  const completedCount = milestones.filter(m => m.completed).length;
  const totalCount = milestones.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddPhoto = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setPhotoModalOpen(true);
  };

  const handleSaveMemory = () => {
    if (!selectedMilestone || !photoUrl) return;
    createMemory.mutate({
      milestoneId: selectedMilestone.id,
      photoUrl,
      caption,
      takenAt,
    });
  };

  // Random celebration message
  const celebrationMessage = celebrationMessages[Math.floor(Date.now() / 86400000) % celebrationMessages.length];

  // Baby age
  const babyAgeMonths = baby ? differenceInMonths(new Date(), new Date(baby.dob)) : 0;

  if (!baby) {
    return (
      <div className="app-container min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500" data-testid="text-baby-not-found">Baby not found</p>
      </div>
    );
  }

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col">
      {/* Celebratory Gradient Header */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/babycare/home/${babyId}`}>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/10 rounded-full h-10 w-10"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-[18px] font-bold flex items-center gap-2" data-testid="text-title">
              Memory Lane
              <PartyPopper className="w-5 h-5" />
            </h1>
            <p className="text-[12px] text-white/80">{baby.name}'s precious firsts</p>
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Inspirational Banner */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-white mb-1">
                "{celebrationMessage}"
              </p>
              <p className="text-[11px] text-white/80">
                {completedCount > 0 
                  ? `${completedCount} beautiful moments celebrated!` 
                  : "Start capturing your baby's special moments"}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Celebration Bar */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="text-[13px] font-medium text-white">Your milestone journey</span>
            </div>
            <span className="text-[14px] font-bold text-white" data-testid="text-progress-count">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-white via-amber-100 to-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              data-testid="progress-bar"
            />
          </div>
          <p className="text-[11px] text-white/80 mt-2 text-center">
            {progressPercent < 20 
              ? "Just beginning this beautiful journey!" 
              : progressPercent < 50 
                ? "So many wonderful moments ahead!" 
                : progressPercent < 80
                  ? "Creating precious memories together!"
                  : "A treasure trove of memories!"}
          </p>
        </div>
      </div>

      {/* Age Filter - Playful Pills */}
      <div className="bg-white border-b border-zinc-100 py-3 px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" data-testid="age-filter-container">
          {AGE_FILTERS.map(filter => {
            const Icon = filter.icon;
            const isActive = selectedAge === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedAge(filter.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
                data-testid={`filter-chip-${filter.id.replace(/\s+/g, "-")}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8 px-4 pt-4">
        {/* Reassurance Card - Warm & Supportive */}
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 rounded-2xl mb-4 overflow-hidden" data-testid="card-reassurance">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-pink-900 mb-1">
                  Every baby grows at their own pace
                </p>
                <p className="text-[12px] text-pink-700 leading-relaxed">
                  These milestones are gentle guides, not deadlines. Your baby is doing wonderfully!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Timeline Preview - If has memories */}
        {memories.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-zinc-900 flex items-center gap-2" data-testid="text-memories-title">
                <Camera className="w-4 h-4 text-amber-500" />
                Recent Memories
              </h2>
              <span className="text-[12px] text-amber-600 font-medium">
                {memories.length} captured
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {memories.slice(0, 5).map((memory) => (
                <div 
                  key={memory.id}
                  className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 border-2 border-white shadow-md"
                  data-testid={`memory-thumb-${memory.id}`}
                >
                  <img 
                    src={memory.photoUrl} 
                    alt={memory.caption || "Memory"} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-dashed border-amber-300 flex flex-col items-center justify-center gap-1">
                <Camera className="w-5 h-5 text-amber-500" />
                <span className="text-[10px] text-amber-600 font-medium">Add more</span>
              </div>
            </div>
          </div>
        )}

        {/* Milestones List */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-zinc-900">
            Developmental Milestones
          </h2>
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            {filteredMilestones.length} milestones
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" data-testid="loading-spinner" />
          </div>
        ) : filteredMilestones.length === 0 ? (
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-200 rounded-2xl" data-testid="text-no-milestones">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[16px] font-bold text-zinc-900 mb-2">
                No milestones in this range
              </h3>
              <p className="text-[13px] text-zinc-500">
                Try selecting a different age filter
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredMilestones.map((milestone, idx) => {
                const MilestoneIcon = getMilestoneIcon(milestone.title);
                const gradient = getMilestoneGradient(idx);
                const memoryForMilestone = memories.find(m => m.milestoneId === milestone.id);
                
                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card 
                      className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                        milestone.completed 
                          ? 'border-green-200 ring-2 ring-green-100' 
                          : 'border-zinc-100'
                      }`}
                      data-testid={`milestone-card-${milestone.id}`}
                    >
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                              milestone.completed 
                                ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                                : `bg-gradient-to-br ${gradient}`
                            }`}>
                              {milestone.completed ? (
                                <Sparkles className="w-6 h-6 text-white" />
                              ) : (
                                <MilestoneIcon className="w-6 h-6 text-white" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className={`text-[14px] font-bold ${
                                  milestone.completed ? "text-green-700" : "text-zinc-900"
                                }`} data-testid={`milestone-title-${milestone.id}`}>
                                  {milestone.title}
                                </p>
                                {milestone.completed && (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] px-2">
                                    <Check className="w-3 h-3 mr-1" />
                                    Done
                                  </Badge>
                                )}
                              </div>
                              {milestone.description && (
                                <p className="text-[12px] text-zinc-500 leading-relaxed" data-testid={`milestone-desc-${milestone.id}`}>
                                  {milestone.description}
                                </p>
                              )}
                              
                              {/* Age Badge */}
                              <div className="mt-2">
                                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full font-medium">
                                  Typically: {milestone.ageGroup}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => {
                                updateMilestone.mutate({ 
                                  id: milestone.id, 
                                  completed: !milestone.completed 
                                });
                              }}
                              className={`flex-1 py-3 px-4 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2 ${
                                milestone.completed
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                              }`}
                              data-testid={`toggle-noticed-${milestone.id}`}
                            >
                              {milestone.completed ? (
                                <>
                                  <PartyPopper className="w-4 h-4" />
                                  Celebrated!
                                </>
                              ) : (
                                <>
                                  <Star className="w-4 h-4" />
                                  Mark as done
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleAddPhoto(milestone)}
                              className={`py-3 px-4 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2 ${
                                memoryForMilestone
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md"
                              }`}
                              data-testid={`button-add-photo-${milestone.id}`}
                            >
                              <Camera className="w-4 h-4" />
                              {memoryForMilestone ? "View" : "Capture"}
                            </button>
                          </div>
                        </div>

                        {/* Memory Preview if exists */}
                        {memoryForMilestone && (
                          <div className="border-t border-zinc-100 p-3 bg-gradient-to-r from-amber-50 to-orange-50">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                                <img 
                                  src={memoryForMilestone.photoUrl} 
                                  alt="Memory" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] text-amber-800 font-medium truncate">
                                  {memoryForMilestone.caption || "A precious memory"}
                                </p>
                                <p className="text-[11px] text-amber-600">
                                  {format(new Date(memoryForMilestone.takenAt), "MMM d, yyyy")}
                                </p>
                              </div>
                              <ImageIcon className="w-4 h-4 text-amber-400" />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* AI Nanny Card - Development Questions */}
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl mt-6 overflow-hidden" data-testid="card-ai-nanny-milestones">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-violet-900 mb-0.5">
                  Questions about development?
                </p>
                <p className="text-[11px] text-violet-600">
                  Ask AI Nanny anything about your baby's milestones
                </p>
              </div>
            </div>
            
            {/* Sample Questions */}
            <div className="space-y-2 mb-4">
              <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-wide">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] bg-white text-violet-700 px-3 py-1.5 rounded-full border border-violet-200">
                  When do babies start walking?
                </span>
                <span className="text-[11px] bg-white text-violet-700 px-3 py-1.5 rounded-full border border-violet-200">
                  Is it normal if my baby isn't talking yet?
                </span>
                <span className="text-[11px] bg-white text-violet-700 px-3 py-1.5 rounded-full border border-violet-200">
                  How to encourage crawling?
                </span>
                <span className="text-[11px] bg-white text-violet-700 px-3 py-1.5 rounded-full border border-violet-200">
                  Baby not making eye contact
                </span>
              </div>
            </div>

            <Link href={`/babycare/ai-nanny/${babyId}`}>
              <Button 
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 text-white rounded-xl shadow-md h-11 font-semibold gap-2"
                data-testid="button-ask-ai-nanny"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with AI Nanny
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Photo Upload Modal - Enhanced */}
      <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
        <DialogContent className="max-w-[90%] rounded-2xl">
          <DialogHeader>
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-center">
              Capture this memory
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-500 text-center">
              Save this precious moment for {selectedMilestone?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="photoUrl" className="text-[13px] font-semibold text-zinc-700">
                Photo URL
              </Label>
              <Input
                id="photoUrl"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Paste image URL here"
                className="mt-1.5 rounded-xl h-12"
                data-testid="input-photo-url"
              />
            </div>

            <div>
              <Label htmlFor="caption" className="text-[13px] font-semibold text-zinc-700">
                Caption (optional)
              </Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What makes this moment special?"
                className="mt-1.5 rounded-xl resize-none"
                rows={2}
                data-testid="input-caption"
              />
            </div>

            <div>
              <Label htmlFor="takenAt" className="text-[13px] font-semibold text-zinc-700">
                When was this?
              </Label>
              <Input
                id="takenAt"
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                className="mt-1.5 rounded-xl h-12"
                data-testid="input-date"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setPhotoModalOpen(false)}
                className="flex-1 rounded-xl h-12"
                data-testid="button-cancel-photo"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveMemory}
                disabled={!photoUrl || createMemory.isPending}
                className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 text-white rounded-xl h-12 font-semibold shadow-lg"
                data-testid="button-save-photo"
              >
                {createMemory.isPending ? "Saving..." : "Save Memory"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
