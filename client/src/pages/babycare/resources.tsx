import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Utensils,
  Dumbbell,
  Heart,
  Moon,
  Zap,
  Baby,
  ChevronRight,
  Check,
  Play,
  Clock,
  Star,
  Phone,
  Video,
  Sparkles,
  Apple,
  Salad,
  Fish,
  Milk,
  Leaf,
  X,
  RefreshCw,
  Stethoscope,
} from "lucide-react";

type Category = "pain" | "nutrition" | "energy" | "sleep" | "stress" | null;
type PainArea = "back" | "neck" | "pelvic" | "headache" | "joints" | null;

interface Exercise {
  title: string;
  duration: string;
  difficulty: string;
  thumbnail: string;
}

interface Food {
  name: string;
  benefit: string;
  icon: typeof Apple;
  color: string;
}

const CATEGORIES = [
  {
    id: "pain",
    label: "Body Pain",
    description: "Back, neck, joints",
    icon: Dumbbell,
    color: "from-rose-400 to-pink-500",
    bg: "bg-rose-50",
  },
  {
    id: "nutrition",
    label: "Nutrition",
    description: "Diet & recovery foods",
    icon: Utensils,
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
  },
  {
    id: "energy",
    label: "Low Energy",
    description: "Feel more awake",
    icon: Zap,
    color: "from-yellow-400 to-amber-500",
    bg: "bg-yellow-50",
  },
  {
    id: "sleep",
    label: "Sleep Issues",
    description: "Rest better",
    icon: Moon,
    color: "from-indigo-400 to-purple-500",
    bg: "bg-indigo-50",
  },
  {
    id: "stress",
    label: "Stress & Anxiety",
    description: "Find calm",
    icon: Heart,
    color: "from-pink-400 to-rose-500",
    bg: "bg-pink-50",
  },
];

const PAIN_AREAS = [
  { id: "back", label: "Lower Back", emoji: "🔙" },
  { id: "neck", label: "Neck & Shoulders", emoji: "🦴" },
  { id: "pelvic", label: "Pelvic Area", emoji: "🌸" },
  { id: "headache", label: "Headaches", emoji: "🤕" },
  { id: "joints", label: "Joints & Wrists", emoji: "🤲" },
];

const EXERCISES: Record<string, Exercise[]> = {
  back: [
    {
      title: "Gentle Cat-Cow Stretches",
      duration: "5 min",
      difficulty: "Easy",
      thumbnail: "🐱",
    },
    {
      title: "Pelvic Tilts for Back Relief",
      duration: "8 min",
      difficulty: "Easy",
      thumbnail: "🧘",
    },
    {
      title: "Child's Pose Sequence",
      duration: "6 min",
      difficulty: "Easy",
      thumbnail: "🙏",
    },
  ],
  neck: [
    {
      title: "Neck Release & Rolls",
      duration: "4 min",
      difficulty: "Easy",
      thumbnail: "🔄",
    },
    {
      title: "Shoulder Blade Squeezes",
      duration: "5 min",
      difficulty: "Easy",
      thumbnail: "💪",
    },
    {
      title: "Upper Back Opener",
      duration: "7 min",
      difficulty: "Medium",
      thumbnail: "🌟",
    },
  ],
  pelvic: [
    {
      title: "Gentle Pelvic Floor Recovery",
      duration: "10 min",
      difficulty: "Easy",
      thumbnail: "🌸",
    },
    {
      title: "Core Reconnection Basics",
      duration: "8 min",
      difficulty: "Easy",
      thumbnail: "🎯",
    },
    {
      title: "Hip Opening Flow",
      duration: "12 min",
      difficulty: "Medium",
      thumbnail: "🦋",
    },
  ],
  headache: [
    {
      title: "Tension Release Massage",
      duration: "5 min",
      difficulty: "Easy",
      thumbnail: "🧠",
    },
    {
      title: "Jaw & Temple Relief",
      duration: "4 min",
      difficulty: "Easy",
      thumbnail: "😌",
    },
    {
      title: "Eye Strain Recovery",
      duration: "3 min",
      difficulty: "Easy",
      thumbnail: "👁️",
    },
  ],
  joints: [
    {
      title: "Wrist Circles & Stretches",
      duration: "4 min",
      difficulty: "Easy",
      thumbnail: "🖐️",
    },
    {
      title: "Gentle Hand Exercises",
      duration: "5 min",
      difficulty: "Easy",
      thumbnail: "✋",
    },
    {
      title: "Full Body Joint Mobility",
      duration: "10 min",
      difficulty: "Medium",
      thumbnail: "🔗",
    },
  ],
};

const FOODS_BY_CATEGORY: Record<string, Food[]> = {
  pain: [
    {
      name: "Fatty Fish (Salmon)",
      benefit: "Omega-3s reduce inflammation",
      icon: Fish,
      color: "from-blue-400 to-cyan-500",
    },
    {
      name: "Leafy Greens",
      benefit: "Vitamin K for healing",
      icon: Leaf,
      color: "from-green-400 to-emerald-500",
    },
    {
      name: "Turmeric & Ginger",
      benefit: "Natural pain relief",
      icon: Sparkles,
      color: "from-amber-400 to-orange-500",
    },
    {
      name: "Berries",
      benefit: "Antioxidants fight swelling",
      icon: Apple,
      color: "from-purple-400 to-pink-500",
    },
  ],
  nutrition: [
    {
      name: "Iron-Rich Foods",
      benefit: "Rebuild blood stores",
      icon: Salad,
      color: "from-red-400 to-rose-500",
    },
    {
      name: "Calcium Sources",
      benefit: "Strong bones for you & baby",
      icon: Milk,
      color: "from-blue-200 to-blue-400",
    },
    {
      name: "Protein-Rich Meals",
      benefit: "Tissue repair & energy",
      icon: Fish,
      color: "from-amber-400 to-orange-500",
    },
    {
      name: "Fiber & Whole Grains",
      benefit: "Digestive health",
      icon: Leaf,
      color: "from-green-400 to-teal-500",
    },
  ],
  energy: [
    {
      name: "Complex Carbs",
      benefit: "Sustained energy release",
      icon: Salad,
      color: "from-amber-300 to-yellow-500",
    },
    {
      name: "Iron + Vitamin C",
      benefit: "Fight fatigue",
      icon: Apple,
      color: "from-red-400 to-orange-500",
    },
    {
      name: "Nuts & Seeds",
      benefit: "Quick healthy fuel",
      icon: Leaf,
      color: "from-amber-500 to-yellow-600",
    },
    {
      name: "Hydrating Foods",
      benefit: "Combat dehydration",
      icon: Milk,
      color: "from-cyan-300 to-blue-400",
    },
  ],
  sleep: [
    {
      name: "Magnesium Foods",
      benefit: "Natural relaxation",
      icon: Leaf,
      color: "from-purple-400 to-indigo-500",
    },
    {
      name: "Tart Cherry Juice",
      benefit: "Natural melatonin",
      icon: Apple,
      color: "from-red-400 to-rose-500",
    },
    {
      name: "Warm Milk",
      benefit: "Tryptophan for sleep",
      icon: Milk,
      color: "from-amber-100 to-amber-300",
    },
    {
      name: "Chamomile Tea",
      benefit: "Calming & soothing",
      icon: Sparkles,
      color: "from-yellow-300 to-amber-400",
    },
  ],
  stress: [
    {
      name: "Dark Chocolate",
      benefit: "Mood-boosting compounds",
      icon: Sparkles,
      color: "from-amber-600 to-amber-800",
    },
    {
      name: "Avocado",
      benefit: "B vitamins for calm",
      icon: Leaf,
      color: "from-green-400 to-emerald-500",
    },
    {
      name: "Oatmeal",
      benefit: "Serotonin production",
      icon: Salad,
      color: "from-amber-300 to-yellow-500",
    },
    {
      name: "Vitamin C Rich Foods",
      benefit: "Lower cortisol",
      icon: Apple,
      color: "from-orange-400 to-amber-500",
    },
  ],
};

const CALMING_EXERCISES = [
  {
    title: "5-Minute Breathing Reset",
    duration: "5 min",
    difficulty: "Easy",
    thumbnail: "🌬️",
  },
  {
    title: "Body Scan Relaxation",
    duration: "10 min",
    difficulty: "Easy",
    thumbnail: "🧘",
  },
  {
    title: "Progressive Muscle Release",
    duration: "8 min",
    difficulty: "Easy",
    thumbnail: "💆",
  },
];

const ENERGY_EXERCISES = [
  {
    title: "Gentle Wake-Up Flow",
    duration: "7 min",
    difficulty: "Easy",
    thumbnail: "☀️",
  },
  {
    title: "Quick Energy Boost",
    duration: "5 min",
    difficulty: "Easy",
    thumbnail: "⚡",
  },
  {
    title: "Energizing Stretches",
    duration: "6 min",
    difficulty: "Easy",
    thumbnail: "🌟",
  },
];

const SLEEP_EXERCISES = [
  {
    title: "Bedtime Wind-Down",
    duration: "10 min",
    difficulty: "Easy",
    thumbnail: "🌙",
  },
  {
    title: "Legs Up The Wall",
    duration: "8 min",
    difficulty: "Easy",
    thumbnail: "🦵",
  },
  {
    title: "Sleep-Ready Breathing",
    duration: "5 min",
    difficulty: "Easy",
    thumbnail: "😴",
  },
];

export default function ResourcesPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<"choose" | "pain-area" | "results">(
    "choose",
  );
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [selectedPainArea, setSelectedPainArea] = useState<PainArea>(null);
  const [showConsultDialog, setShowConsultDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId as Category);
    if (categoryId === "pain") {
      setStep("pain-area");
    } else {
      setStep("results");
    }
  };

  const handlePainAreaSelect = (areaId: string) => {
    setSelectedPainArea(areaId as PainArea);
    setStep("results");
  };

  const handleReset = () => {
    setStep("choose");
    setSelectedCategory(null);
    setSelectedPainArea(null);
  };

  const handlePlayVideo = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowVideoDialog(true);
  };

  const getExercises = (): Exercise[] => {
    if (selectedCategory === "pain" && selectedPainArea) {
      return EXERCISES[selectedPainArea] || [];
    }
    if (selectedCategory === "stress") return CALMING_EXERCISES;
    if (selectedCategory === "energy") return ENERGY_EXERCISES;
    if (selectedCategory === "sleep") return SLEEP_EXERCISES;
    return [];
  };

  const getFoods = (): Food[] => {
    if (selectedCategory) {
      return FOODS_BY_CATEGORY[selectedCategory] || [];
    }
    return [];
  };

  const getCategoryInfo = () =>
    CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="app-container bg-gradient-to-b from-amber-50 to-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 px-4 pt-4 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/babycare/home?tab=mother">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-xl"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1
              className="text-[20px] font-bold text-white"
              data-testid="page-title"
            >
              Wellness Resources
            </h1>
            <p className="text-[11px] text-amber-100">
              Your personalized recovery guide
            </p>
          </div>
          {step !== "choose" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 text-[11px]"
              onClick={handleReset}
              data-testid="button-restart"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Start Over
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {/* Step 1: Choose Category */}
        {step === "choose" && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="text-[15px] font-semibold text-zinc-800">
                What would you like help with today?
              </p>
              <p className="text-[12px] text-zinc-500 mt-1">
                We'll recommend exercises & nutrition for you
              </p>
            </div>

            <div className="space-y-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full flex items-center gap-4 p-4 ${cat.bg} rounded-2xl border border-zinc-100 hover:shadow-md transition-all text-left`}
                  data-testid={`category-${cat.id}`}
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center shadow-md`}
                  >
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-zinc-800">
                      {cat.label}
                    </p>
                    <p className="text-[12px] text-zinc-500">
                      {cat.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pain Area Selection (only for pain category) */}
        {step === "pain-area" && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="text-[15px] font-semibold text-zinc-800">
                Where does it hurt?
              </p>
              <p className="text-[12px] text-zinc-500 mt-1">
                We'll find the right exercises for you
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PAIN_AREAS.map((area) => (
                <button
                  key={area.id}
                  onClick={() => handlePainAreaSelect(area.id)}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-zinc-100 hover:shadow-md hover:border-rose-200 transition-all"
                  data-testid={`pain-area-${area.id}`}
                >
                  <span className="text-3xl">{area.emoji}</span>
                  <p className="text-[13px] font-semibold text-zinc-700">
                    {area.label}
                  </p>
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              className="w-full text-zinc-500"
              onClick={() => setStep("choose")}
              data-testid="button-back-to-categories"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to categories
            </Button>
          </div>
        )}

        {/* Step 3: Results */}
        {step === "results" && (
          <div className="space-y-5">
            {/* Category Header */}
            <div className={`${getCategoryInfo()?.bg} rounded-2xl p-4`}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${getCategoryInfo()?.color} rounded-xl flex items-center justify-center`}
                >
                  {(() => {
                    const info = getCategoryInfo();
                    if (!info) return null;
                    const Icon = info.icon;
                    return <Icon className="w-5 h-5 text-white" />;
                  })()}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-zinc-800">
                    {selectedCategory === "pain" && selectedPainArea
                      ? `${PAIN_AREAS.find((p) => p.id === selectedPainArea)?.label} Relief`
                      : getCategoryInfo()?.label}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Personalized recommendations for you
                  </p>
                </div>
              </div>
            </div>

            {/* Exercises Section */}
            {getExercises().length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Play className="w-4 h-4 text-rose-500" />
                  <h3 className="text-[14px] font-bold text-zinc-800">
                    Recommended Exercises
                  </h3>
                </div>
                <div className="space-y-2">
                  {getExercises().map((exercise, i) => (
                    <Card
                      key={i}
                      className="bg-white border border-zinc-100 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handlePlayVideo(exercise)}
                      data-testid={`exercise-${i}`}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl">
                          {exercise.thumbnail}
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-zinc-800">
                            {exercise.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-zinc-100 text-zinc-600 text-[9px] px-1.5 py-0.5">
                              <Clock className="w-2.5 h-2.5 mr-0.5" />{" "}
                              {exercise.duration}
                            </Badge>
                            <Badge className="bg-emerald-50 text-emerald-600 text-[9px] px-1.5 py-0.5">
                              {exercise.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="w-4 h-4 text-amber-500" />
                <h3 className="text-[14px] font-bold text-zinc-800">
                  Foods That Help
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {getFoods().map((food, i) => (
                  <Card
                    key={i}
                    className="bg-white border border-zinc-100 rounded-xl"
                    data-testid={`food-${i}`}
                  >
                    <CardContent className="p-3">
                      <div
                        className={`w-9 h-9 bg-gradient-to-br ${food.color} rounded-lg flex items-center justify-center mb-2`}
                      >
                        <food.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-[12px] font-semibold text-zinc-800 leading-tight">
                        {food.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
                        {food.benefit}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <Card
              className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl"
              data-testid="card-tips"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <h3 className="text-[13px] font-bold text-zinc-800">
                    Quick Tips
                  </h3>
                </div>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-[11px] text-zinc-600">
                    <Check className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Start slow and listen to your body</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] text-zinc-600">
                    <Check className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Stay hydrated—drink water before & after</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] text-zinc-600">
                    <Check className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Consistency matters more than intensity</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Still Need Help */}
            <Card
              className="bg-gradient-to-br from-rose-500 to-pink-600 border-0 rounded-2xl"
              data-testid="card-consult"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-white">
                      Still not feeling better?
                    </p>
                    <p className="text-[11px] text-rose-100">
                      Talk to a specialist for personalized care
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full mt-3 bg-white hover:bg-white/90 text-rose-600 font-semibold rounded-xl"
                  onClick={() => setShowConsultDialog(true)}
                  data-testid="button-consult"
                >
                  <Phone className="w-4 h-4 mr-2" /> Consult a Doctor
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent
          className="max-w-[340px] rounded-2xl"
          data-testid="dialog-video"
        >
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold flex items-center gap-2">
              <Play className="w-4 h-4 text-rose-500" />
              {selectedExercise?.title}
            </DialogTitle>
            <DialogDescription className="text-[12px]">
              {selectedExercise?.duration} • {selectedExercise?.difficulty}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="aspect-video bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex flex-col items-center justify-center">
              <span className="text-5xl mb-3">
                {selectedExercise?.thumbnail}
              </span>
              <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
              <p className="text-[12px] text-zinc-500 mt-3">
                Video coming soon!
              </p>
            </div>

            <div className="mt-4 bg-amber-50 rounded-xl p-3">
              <p className="text-[11px] text-amber-700 font-medium">
                💡 Tip: Practice this exercise 2-3 times daily for best results
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowVideoDialog(false)}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl"
          >
            Got it!
          </Button>
        </DialogContent>
      </Dialog>

      {/* Consult Dialog */}
      <Dialog open={showConsultDialog} onOpenChange={setShowConsultDialog}>
        <DialogContent
          className="max-w-[340px] rounded-2xl"
          data-testid="dialog-consult"
        >
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-rose-500" />
              Book a Consultation
            </DialogTitle>
            <DialogDescription className="text-[12px]">
              Connect with our specialists
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <button
              className="w-full flex items-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100 hover:border-violet-200 transition-colors text-left"
              onClick={() => {
                setShowConsultDialog(false);
                toast({
                  title: "Booking initiated!",
                  description: "A specialist will call you shortly.",
                });
              }}
              data-testid="consult-physio"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-zinc-700">
                  Physiotherapist
                </p>
                <p className="text-[11px] text-zinc-500">
                  Pain & recovery specialist
                </p>
              </div>
              <Badge className="bg-violet-100 text-violet-700 text-[9px]">
                ₹299
              </Badge>
            </button>

            <button
              className="w-full flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors text-left"
              onClick={() => {
                setShowConsultDialog(false);
                toast({
                  title: "Booking initiated!",
                  description: "A nutritionist will call you shortly.",
                });
              }}
              data-testid="consult-nutrition"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-zinc-700">
                  Nutritionist
                </p>
                <p className="text-[11px] text-zinc-500">
                  Diet & recovery planning
                </p>
              </div>
              <Badge className="bg-amber-100 text-amber-700 text-[9px]">
                ₹249
              </Badge>
            </button>

            <button
              className="w-full flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100 hover:border-rose-200 transition-colors text-left"
              onClick={() => {
                setShowConsultDialog(false);
                toast({
                  title: "Booking initiated!",
                  description: "A doctor will call you shortly.",
                });
              }}
              data-testid="consult-doctor"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-zinc-700">
                  General Physician
                </p>
                <p className="text-[11px] text-zinc-500">
                  For persistent symptoms
                </p>
              </div>
              <Badge className="bg-rose-100 text-rose-700 text-[9px]">
                ₹199
              </Badge>
            </button>
          </div>

          <p className="text-[10px] text-zinc-400 text-center">
            Consultations are covered under your wellness plan
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
