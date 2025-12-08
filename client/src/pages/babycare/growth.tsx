import { useState } from "react";
import { Link, useParams } from "wouter";
import { 
  ArrowLeft, 
  Plus,
  Scale,
  Ruler,
  Circle,
  TrendingUp,
  Sparkles,
  Heart,
  Star,
  ChevronUp,
  Baby,
  Leaf
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BabyProfile, GrowthEntry } from "@shared/schema";
import { format, differenceInMonths } from "date-fns";

type GrowthType = "weight" | "height" | "head";

const typeConfig = {
  weight: { 
    label: "Weight", 
    unit: "kg", 
    icon: Scale, 
    gradient: "from-blue-400 to-cyan-500",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    emptyMessage: "Every gram counts!",
    emptySubtext: "Track your little one's weight and watch them grow stronger every day",
    tip: "Healthy babies usually double their birth weight by 5 months"
  },
  height: { 
    label: "Height", 
    unit: "cm", 
    icon: Ruler, 
    gradient: "from-emerald-400 to-teal-500",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    emptyMessage: "Growing taller every day!",
    emptySubtext: "Measure their height and celebrate each precious centimeter",
    tip: "Babies grow about 25cm in their first year!"
  },
  head: { 
    label: "Head", 
    unit: "cm", 
    icon: Circle, 
    gradient: "from-violet-400 to-purple-500",
    bgLight: "bg-violet-50",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
    emptyMessage: "A growing mind!",
    emptySubtext: "Head circumference is a key indicator of healthy brain development",
    tip: "Head grows about 12cm in the first year"
  },
};

const inspirationalQuotes = [
  "Every measurement tells a story of love and care",
  "Growing together, one day at a time",
  "Cherish these moments of growth",
  "Your little one is thriving!",
  "Building a beautiful future, inch by inch"
];

export default function BabyCareGrowth() {
  const params = useParams();
  const babyId = params.babyId;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<GrowthType>("weight");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: profiles = [] } = useQuery<BabyProfile[]>({
    queryKey: ["/api/baby-profiles"],
  });

  const baby = profiles.find(p => p.id === babyId);

  const { data: growthEntries = [], isLoading } = useQuery<GrowthEntry[]>({
    queryKey: ["/api/baby-profiles", babyId, "growth"],
    enabled: !!babyId,
  });

  const addEntry = useMutation({
    mutationFn: async (data: { type: string; value: string; recordedAt: string }) => {
      const response = await apiRequest("POST", `/api/baby-profiles/${babyId}/growth`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/baby-profiles", babyId, "growth"] });
      toast({
        title: "Measurement added!",
        description: "Growth entry recorded successfully.",
      });
      setShowAddModal(false);
      setNewValue("");
    },
  });

  const handleAddEntry = () => {
    if (newValue && newDate) {
      addEntry.mutate({
        type: activeTab,
        value: newValue,
        recordedAt: newDate,
      });
    }
  };

  const filteredEntries = growthEntries
    .filter(e => e.type === activeTab)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  const config = typeConfig[activeTab];

  // Calculate growth stats
  const latestEntry = filteredEntries[0];
  const previousEntry = filteredEntries[1];
  const growthDiff = latestEntry && previousEntry 
    ? (parseFloat(latestEntry.value) - parseFloat(previousEntry.value)).toFixed(1)
    : null;

  // Random inspirational quote
  const randomQuote = inspirationalQuotes[Math.floor(Date.now() / 86400000) % inspirationalQuotes.length];

  // Calculate baby age in months
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
      {/* Rich Gradient Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white px-4 pt-4 pb-6">
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
            <h1 className="text-[18px] font-bold" data-testid="text-title">Growth Journey</h1>
            <p className="text-[12px] text-white/80">Track {baby.name}'s growth</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Inspirational Banner */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-white leading-relaxed">
                "{randomQuote}"
              </p>
              <p className="text-[11px] text-white/70 mt-1">
                {baby.name} is {babyAgeMonths} months old
              </p>
            </div>
          </div>
        </div>

        {/* Latest Stats - Rich Cards */}
        <div className="grid grid-cols-3 gap-2">
          {(["weight", "height", "head"] as GrowthType[]).map((type) => {
            const latest = growthEntries.find(e => e.type === type);
            const cfg = typeConfig[type];
            const isActive = activeTab === type;
            return (
              <button 
                key={type} 
                onClick={() => setActiveTab(type)}
                className={`p-3 text-center rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white shadow-lg scale-105' 
                    : 'bg-white/15 hover:bg-white/25'
                }`} 
                data-testid={`card-stat-${type}`}
              >
                <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center ${
                  isActive ? `bg-gradient-to-br ${cfg.gradient}` : 'bg-white/20'
                }`}>
                  <cfg.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/80'}`} />
                </div>
                <p className={`text-[18px] font-bold ${isActive ? 'text-zinc-900' : 'text-white'}`}>
                  {latest ? latest.value : "—"}
                </p>
                <p className={`text-[10px] ${isActive ? 'text-zinc-500' : 'text-white/70'}`}>
                  {cfg.unit}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        {/* Growth Insight Card */}
        {latestEntry && (
          <Card className={`${config.bgLight} border ${config.borderColor} rounded-2xl mb-4 overflow-hidden`} data-testid="card-growth-insight">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                  <config.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[24px] font-bold text-zinc-900">{latestEntry.value}</span>
                    <span className="text-[14px] text-zinc-500">{config.unit}</span>
                    {growthDiff && parseFloat(growthDiff) > 0 && (
                      <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        <ChevronUp className="w-3 h-3" />
                        <span className="text-[11px] font-bold">+{growthDiff}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[12px] text-zinc-500">
                    Last updated {format(new Date(latestEntry.recordedAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <Sparkles className={`w-5 h-5 ${config.textColor} mb-1`} />
                  <span className="text-[10px] text-zinc-400">Tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fun Tip Card */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl mb-4" data-testid="card-fun-tip">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">Did you know?</p>
              <p className="text-[12px] text-amber-800">{config.tip}</p>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        {filteredEntries.length > 1 && (
          <Card className="bg-white border border-zinc-100 rounded-2xl mb-4 overflow-hidden" data-testid="card-trend-chart">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[14px] font-bold text-zinc-900">Growth Trend</h4>
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">Healthy progress</span>
                </div>
              </div>
              <div className="flex items-end gap-2 h-20">
                {filteredEntries.slice(0, 8).reverse().map((entry, idx) => {
                  const values = filteredEntries.map(e => parseFloat(e.value));
                  const max = Math.max(...values);
                  const min = Math.min(...values);
                  const range = max - min || 1;
                  const heightPx = ((parseFloat(entry.value) - min) / range) * 56 + 16;
                  
                  return (
                    <div key={entry.id} className="flex-1 flex flex-col items-center gap-1" data-testid={`chart-bar-${entry.id}`}>
                      <div 
                        className={`w-full rounded-lg bg-gradient-to-t ${config.gradient} shadow-sm`}
                        style={{ height: `${heightPx}px` }}
                      />
                      <span className="text-[9px] text-zinc-400 font-medium">
                        {format(new Date(entry.recordedAt), "MM/dd")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Section */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[14px] font-bold text-zinc-900" data-testid="text-history-title">
            Measurement History
          </h4>
          <span className="text-[12px] text-zinc-500">
            {filteredEntries.length} entries
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" data-testid="loading-spinner" />
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className="space-y-2">
            {filteredEntries.map((entry, idx) => (
              <Card 
                key={entry.id} 
                className={`bg-white border ${idx === 0 ? config.borderColor : 'border-zinc-100'} rounded-xl ${idx === 0 ? 'ring-2 ring-offset-2 ' + config.borderColor : ''}`} 
                data-testid={`growth-entry-${entry.id}`}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      idx === 0 ? `bg-gradient-to-br ${config.gradient}` : config.bgLight
                    }`}>
                      <config.icon className={`w-5 h-5 ${idx === 0 ? 'text-white' : config.textColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[16px] font-bold text-zinc-900" data-testid={`entry-value-${entry.id}`}>
                          {entry.value} {config.unit}
                        </p>
                        {idx === 0 && (
                          <span className="text-[10px] font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-zinc-500" data-testid={`entry-date-${entry.id}`}>
                        {format(new Date(entry.recordedAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  {entry.percentile && (
                    <span className={`text-[12px] font-semibold ${config.textColor} ${config.bgLight} px-2.5 py-1 rounded-full`} data-testid={`entry-percentile-${entry.id}`}>
                      {entry.percentile}th %ile
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Rich Empty State */
          <Card className={`bg-gradient-to-br ${config.bgLight} border-2 border-dashed ${config.borderColor} rounded-2xl overflow-hidden`} data-testid="card-empty-state">
            <CardContent className="p-8 text-center">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                <config.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-[18px] font-bold text-zinc-900 mb-2">
                {config.emptyMessage}
              </h3>
              <p className="text-[13px] text-zinc-500 mb-4 max-w-xs mx-auto">
                {config.emptySubtext}
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-[12px] text-zinc-400">Keep track of every precious moment</span>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className={`bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white rounded-xl h-11 px-6 font-semibold shadow-lg gap-2`}
              >
                <Plus className="w-4 h-4" />
                Add First Measurement
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Add Button */}
      {filteredEntries.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto">
          <Button
            onClick={() => setShowAddModal(true)}
            className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white rounded-2xl h-14 text-[15px] font-semibold shadow-xl gap-2`}
            data-testid="button-add-measurement"
          >
            <Plus className="w-5 h-5" />
            Add {config.label} Measurement
          </Button>
        </div>
      )}

      {/* Add Entry Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-[340px] rounded-2xl" data-testid="dialog-add-measurement">
          <DialogHeader>
            <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
              <config.icon className="w-7 h-7 text-white" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-center">Add {config.label}</DialogTitle>
            <DialogDescription className="text-center text-[13px]">
              Record a new measurement for {baby.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-zinc-700">
                {config.label} ({config.unit})
              </Label>
              <Input
                type="number"
                step="0.1"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={`Enter ${config.label.toLowerCase()}`}
                className="h-12 rounded-xl text-[16px]"
                data-testid="input-value"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-zinc-700">Date</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-12 rounded-xl"
                data-testid="input-date"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="flex-1 rounded-xl"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEntry}
              disabled={!newValue || addEntry.isPending}
              className={`flex-1 bg-gradient-to-r ${config.gradient} hover:opacity-90 rounded-xl`}
              data-testid="button-save-measurement"
            >
              {addEntry.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
