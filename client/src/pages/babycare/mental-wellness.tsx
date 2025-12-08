import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Heart, Sun, Cloud, CloudRain, Sparkles,
  Moon, Smile, TrendingUp, Calendar,
  MessageSquare, Phone, ChevronRight, Check, Zap, Flower2, Waves
} from "lucide-react";
import { format, subDays, isToday } from "date-fns";

interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  notes: string;
  timestamp: string;
}

const MOOD_OPTIONS = [
  { id: "radiant", label: "Radiant", emoji: "✨", color: "from-amber-400 to-yellow-500", bg: "bg-amber-50", text: "text-amber-700" },
  { id: "peaceful", label: "Peaceful", emoji: "🌸", color: "from-pink-400 to-rose-500", bg: "bg-pink-50", text: "text-pink-700" },
  { id: "okay", label: "Okay", emoji: "🌤️", color: "from-blue-400 to-cyan-500", bg: "bg-blue-50", text: "text-blue-700" },
  { id: "tired", label: "Tired", emoji: "😴", color: "from-indigo-400 to-purple-500", bg: "bg-indigo-50", text: "text-indigo-700" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "🌊", color: "from-slate-400 to-zinc-500", bg: "bg-slate-50", text: "text-slate-700" },
  { id: "struggling", label: "Struggling", emoji: "🌧️", color: "from-gray-400 to-slate-500", bg: "bg-gray-50", text: "text-gray-700" },
];

const AFFIRMATIONS = [
  "You are exactly the parent your baby needs.",
  "It's okay to not have all the answers.",
  "Your feelings are valid. Every single one.",
  "Rest is essential. You deserve it.",
  "You are doing an incredible job.",
  "Asking for help is a sign of strength.",
  "This moment is temporary.",
  "Your baby loves you completely.",
  "Small steps are still progress.",
  "You are more resilient than you know.",
];

const getMoodEntries = (): MoodEntry[] => {
  try {
    const data = localStorage.getItem("mood_entries");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveMoodEntry = (entry: MoodEntry) => {
  const entries = getMoodEntries();
  const existingIndex = entries.findIndex(e => e.date === entry.date);
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  localStorage.setItem("mood_entries", JSON.stringify(entries));
};

export default function MentalWellnessPage() {
  const { toast } = useToast();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [todayAffirmation, setTodayAffirmation] = useState("");

  useEffect(() => {
    setMoodEntries(getMoodEntries());
    const dayIndex = new Date().getDate() % AFFIRMATIONS.length;
    setTodayAffirmation(AFFIRMATIONS[dayIndex]);
  }, []);

  const todayEntry = moodEntries.find(e => e.date === format(new Date(), "yyyy-MM-dd"));
  const hasCheckedInToday = !!todayEntry;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const entry = moodEntries.find(e => e.date === format(date, "yyyy-MM-dd"));
    return { date, dayName: format(date, "EEE"), entry };
  });

  const getMoodEmoji = (moodId: string) => MOOD_OPTIONS.find(m => m.id === moodId)?.emoji || "•";
  const getMoodColor = (moodId: string) => MOOD_OPTIONS.find(m => m.id === moodId)?.color || "from-gray-400 to-gray-500";

  const handleSaveCheckIn = () => {
    if (!selectedMood) return;
    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: format(new Date(), "yyyy-MM-dd"),
      mood: selectedMood,
      notes,
      timestamp: new Date().toISOString(),
    };
    saveMoodEntry(entry);
    setMoodEntries(getMoodEntries());
    setShowCheckIn(false);
    setSelectedMood(null);
    setNotes("");
    toast({ title: "Check-in saved 💜", description: "Thank you for taking a moment for yourself." });
  };

  const streak = (() => {
    let count = 0;
    const sorted = [...moodEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (let i = 0; i < 30; i++) {
      const checkDate = format(subDays(new Date(), i), "yyyy-MM-dd");
      if (sorted.find(e => e.date === checkDate)) count++;
      else if (i > 0) break;
    }
    return count;
  })();

  return (
    <div className="app-container bg-gradient-to-b from-purple-50 to-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 px-4 pt-4 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/babycare/home?tab=mother">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-[20px] font-bold text-white" data-testid="page-title">Mental Wellness</h1>
        </div>

        {/* Check-in CTA */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
          {hasCheckedInToday && todayEntry ? (
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${getMoodColor(todayEntry.mood)} rounded-xl flex items-center justify-center text-xl`}>
                {getMoodEmoji(todayEntry.mood)}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-white">
                  Feeling {MOOD_OPTIONS.find(m => m.id === todayEntry.mood)?.label.toLowerCase()}
                </p>
                <p className="text-[11px] text-purple-100">Checked in today</p>
              </div>
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 text-[11px]" onClick={() => setShowCheckIn(true)} data-testid="button-update">
                Update
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-white">How are you today?</p>
                <p className="text-[11px] text-purple-100">Take a moment for yourself</p>
              </div>
              <Button className="bg-white hover:bg-white/90 text-purple-600 font-semibold rounded-xl text-[13px]" onClick={() => setShowCheckIn(true)} data-testid="button-checkin">
                <Heart className="w-4 h-4 mr-1.5" /> Check In
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl" data-testid="card-streak">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[20px] font-bold text-zinc-900">{streak}</p>
                <p className="text-[10px] text-amber-700 font-medium">Day streak</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl" data-testid="card-positive">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[20px] font-bold text-zinc-900">{last7Days.filter(d => d.entry && ["radiant", "peaceful", "okay"].includes(d.entry.mood)).length}/7</p>
                <p className="text-[10px] text-emerald-700 font-medium">Good days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Mood */}
        <Card className="bg-white border border-zinc-100 rounded-2xl" data-testid="card-weekly">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-purple-600" />
              <h3 className="text-[14px] font-bold text-zinc-900">This Week</h3>
            </div>
            <div className="flex justify-between">
              {last7Days.map((day, i) => (
                <div key={i} className={`flex flex-col items-center gap-1.5 flex-1 py-1.5 rounded-lg ${isToday(day.date) ? "bg-purple-50" : ""}`}>
                  <span className={`text-[9px] font-medium ${isToday(day.date) ? "text-purple-600" : "text-zinc-400"}`}>{day.dayName}</span>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${day.entry ? `bg-gradient-to-br ${getMoodColor(day.entry.mood)}` : "bg-zinc-100"}`}>
                    {day.entry ? getMoodEmoji(day.entry.mood) : <span className="text-zinc-300 text-sm">•</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Affirmation */}
        <Card className="bg-gradient-to-br from-pink-500 to-rose-500 border-0 rounded-2xl" data-testid="card-affirmation">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-pink-100 font-medium mb-0.5">Today's Affirmation</p>
                <p className="text-[13px] text-white font-medium leading-snug">"{todayAffirmation}"</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-white border border-zinc-100 rounded-2xl" data-testid="card-support">
          <CardContent className="p-4 space-y-2">
            <h3 className="text-[14px] font-bold text-zinc-900 mb-2">Support</h3>
            
            <Link href="/babycare/mother-ai-chat">
              <div className="flex items-center gap-3 bg-violet-50 rounded-xl p-3" data-testid="link-ai">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-zinc-700">Talk to Mother AI</p>
                  <p className="text-[10px] text-zinc-500">24/7 support</p>
                </div>
                <ChevronRight className="w-4 h-4 text-violet-400" />
              </div>
            </Link>

            <div className="flex items-center gap-3 bg-pink-50 rounded-xl p-3" data-testid="tile-helpline">
              <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-zinc-700">Postpartum Helpline</p>
                <p className="text-[10px] text-zinc-500">Speak to a counselor</p>
              </div>
              <Badge className="bg-pink-100 text-pink-700 text-[9px]">24/7</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Gentle note */}
        <p className="text-[11px] text-zinc-400 text-center px-4 leading-relaxed">
          It's okay to not be okay. Reach out if you need support. 💜
        </p>
      </div>

      {/* Check-In Dialog */}
      <Dialog open={showCheckIn} onOpenChange={setShowCheckIn}>
        <DialogContent className="max-w-[340px] rounded-2xl" data-testid="dialog-checkin">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold">How are you feeling?</DialogTitle>
            <DialogDescription className="text-[12px]">Select what best describes you right now</DialogDescription>
          </DialogHeader>

          <div className="py-3 grid grid-cols-2 gap-2">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${selectedMood === mood.id ? `border-purple-400 ${mood.bg}` : "border-zinc-100"}`}
                data-testid={`mood-${mood.id}`}
              >
                <div className={`w-9 h-9 bg-gradient-to-br ${mood.color} rounded-lg flex items-center justify-center text-base`}>
                  {mood.emoji}
                </div>
                <span className={`text-[12px] font-semibold ${mood.text}`}>{mood.label}</span>
              </button>
            ))}
          </div>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any thoughts? (optional)"
            className="min-h-[80px] resize-none rounded-xl text-[13px]"
            data-testid="textarea-notes"
          />

          <DialogFooter>
            <Button onClick={handleSaveCheckIn} disabled={!selectedMood} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl" data-testid="button-save">
              <Check className="w-4 h-4 mr-2" /> Save Check-In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
