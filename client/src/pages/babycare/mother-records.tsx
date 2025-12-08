import { Link } from "wouter";
import { 
  ArrowLeft, Heart, Milk, Dumbbell, Brain, FileText, StickyNote, Plus, 
  Calendar, Shield, Upload, ClipboardList, FilePlus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type RecordType = "consult" | "note" | "report";
type ConsultCategory = "lactation" | "physio" | "mental" | "general";
type FilterType = "all" | "consult" | "note" | "report";

interface HealthRecord {
  id: string;
  date: string;
  type: RecordType;
  category?: ConsultCategory;
  title: string;
  description: string;
}

const recordTypeInfo = {
  consult: { 
    label: "Consults", 
    icon: Heart, 
    gradient: "from-pink-400 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-100",
    iconBg: "bg-gradient-to-br from-pink-400 to-rose-500",
    textColor: "text-pink-700"
  },
  note: { 
    label: "Notes", 
    icon: StickyNote, 
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    textColor: "text-amber-700"
  },
  report: { 
    label: "Reports", 
    icon: FileText, 
    gradient: "from-violet-400 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
    iconBg: "bg-gradient-to-br from-violet-400 to-purple-500",
    textColor: "text-violet-700"
  },
};

const categoryInfo = {
  lactation: { label: "Lactation", icon: Milk, color: "from-blue-400 to-cyan-500", bg: "bg-blue-100", textColor: "text-blue-600" },
  physio: { label: "Physio", icon: Dumbbell, color: "from-green-400 to-emerald-500", bg: "bg-green-100", textColor: "text-green-600" },
  mental: { label: "Mental", icon: Brain, color: "from-purple-400 to-violet-500", bg: "bg-purple-100", textColor: "text-purple-600" },
  general: { label: "General", icon: Heart, color: "from-pink-400 to-rose-500", bg: "bg-pink-100", textColor: "text-pink-600" },
};

const initialRecords: HealthRecord[] = [
  {
    id: "1",
    date: "2024-11-28",
    type: "consult",
    category: "lactation",
    title: "Lactation consultation",
    description: "Discussed latch techniques and feeding schedule. Baby gaining weight well.",
  },
  {
    id: "2",
    date: "2024-11-25",
    type: "note",
    title: "Feeling better today",
    description: "Energy levels improving. Managed a 15-minute walk outside.",
  },
  {
    id: "3",
    date: "2024-11-22",
    type: "consult",
    category: "physio",
    title: "Back pain physio session",
    description: "Core strengthening exercises prescribed. Follow-up in 2 weeks.",
  },
  {
    id: "4",
    date: "2024-11-18",
    type: "report",
    title: "Blood test results",
    description: "Iron levels improving. Continue with supplements.",
  },
  {
    id: "5",
    date: "2024-11-15",
    type: "consult",
    category: "mental",
    title: "Mental wellness check-in",
    description: "Discussed sleep patterns and mood. Feeling supported.",
  },
  {
    id: "6",
    date: "2024-10-10",
    type: "consult",
    category: "lactation",
    title: "Lactation follow-up",
    description: "Addressed breast soreness. New positioning techniques helping.",
  },
];

function getTypeIconComponent(type: RecordType, category?: ConsultCategory) {
  if (type === "note") return StickyNote;
  if (type === "report") return FileText;
  if (category && categoryInfo[category]) return categoryInfo[category].icon;
  return Heart;
}

function getTypeGradient(type: RecordType, category?: ConsultCategory) {
  if (type === "note") return recordTypeInfo.note.iconBg;
  if (type === "report") return recordTypeInfo.report.iconBg;
  if (category && categoryInfo[category]) return `bg-gradient-to-br ${categoryInfo[category].color}`;
  return recordTypeInfo.consult.iconBg;
}

function getTypeBorder(type: RecordType) {
  return recordTypeInfo[type]?.border || "border-pink-100";
}

export default function MotherRecords() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [records, setRecords] = useState<HealthRecord[]>(initialRecords);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const [newRecordType, setNewRecordType] = useState<RecordType>("note");
  const [newRecordCategory, setNewRecordCategory] = useState<ConsultCategory>("general");
  const [newRecordTitle, setNewRecordTitle] = useState("");
  const [newRecordDescription, setNewRecordDescription] = useState("");

  const resetForm = () => {
    setNewRecordType("note");
    setNewRecordCategory("general");
    setNewRecordTitle("");
    setNewRecordDescription("");
  };

  const handleAddRecord = () => {
    if (!newRecordTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your record.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const newRecord: HealthRecord = {
      id: `new-${Date.now()}`,
      date: today,
      type: newRecordType,
      category: newRecordType === "consult" ? newRecordCategory : undefined,
      title: newRecordTitle.trim(),
      description: newRecordDescription.trim() || "No description added.",
    };

    setRecords((prev) => [newRecord, ...prev]);
    setShowAddDialog(false);
    resetForm();
    
    toast({
      title: "Record added",
      description: "Your health record has been saved.",
    });
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (activeFilter === "all") return true;
      return record.type === activeFilter;
    });
  }, [records, activeFilter]);

  const stats = useMemo(() => ({
    consults: records.filter(r => r.type === "consult").length,
    notes: records.filter(r => r.type === "note").length,
    reports: records.filter(r => r.type === "report").length,
    total: records.length,
  }), [records]);

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "consult", label: "Consults", count: stats.consults },
    { key: "note", label: "Notes", count: stats.notes },
    { key: "report", label: "Reports", count: stats.reports },
  ];

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, HealthRecord[]> = {};
    filteredRecords.forEach(record => {
      const key = format(parseISO(record.date), "MMMM yyyy");
      if (!groups[key]) groups[key] = [];
      groups[key].push(record);
    });
    return groups;
  }, [filteredRecords]);

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col relative">
      {/* Rich Gradient Header */}
      <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/babycare/home?tab=mother" data-testid="link-back">
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
              <Shield className="w-5 h-5" />
              Health Records
            </h1>
            <p className="text-[12px] text-white/80">Your complete wellness history</p>
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-[20px] font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-white/80 font-medium">Total Records</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-[20px] font-bold text-white">{stats.consults}</p>
            <p className="text-[10px] text-white/80 font-medium">Consults</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-[20px] font-bold text-white">{stats.reports}</p>
            <p className="text-[10px] text-white/80 font-medium">Reports</p>
          </div>
        </div>

        {/* Quick Add CTA */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-white">Keep records organized</p>
              <p className="text-[11px] text-white/70">Log consults, notes & reports</p>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              size="sm"
              className="bg-white text-pink-600 hover:bg-white/90 rounded-xl font-semibold shadow-lg"
              data-testid="button-quick-add"
            >
              <FilePlus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Chips with Counts */}
      <div className="bg-white border-b border-zinc-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filters.map(filter => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
                data-testid={`filter-${filter.key}`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20" : "bg-zinc-200"
                  }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto pb-32 px-4 pt-4">
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6" data-testid="empty-state">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
              activeFilter !== "all" 
                ? recordTypeInfo[activeFilter].iconBg 
                : "bg-gradient-to-br from-pink-400 to-rose-500"
            }`}>
              {activeFilter === "consult" ? (
                <Heart className="w-10 h-10 text-white" />
              ) : activeFilter === "report" ? (
                <FileText className="w-10 h-10 text-white" />
              ) : activeFilter === "note" ? (
                <StickyNote className="w-10 h-10 text-white" />
              ) : (
                <ClipboardList className="w-10 h-10 text-white" />
              )}
            </div>
            <p className="text-[16px] text-zinc-900 text-center font-bold mb-2" data-testid="text-empty-title">
              {activeFilter === "consult" ? "No consults logged yet" : 
               activeFilter === "report" ? "No reports uploaded" : 
               activeFilter === "note" ? "No notes added" :
               "Start your health journey"}
            </p>
            <p className="text-[13px] text-zinc-500 text-center max-w-[280px] mb-6" data-testid="text-empty-description">
              {activeFilter === "consult" 
                ? "Log consultations with specialists, therapists, and healthcare providers."
                : activeFilter === "report" 
                ? "Upload medical reports, test results, and important health documents."
                : activeFilter === "note"
                ? "Add personal notes about how you're feeling and your recovery progress."
                : "Track your wellness journey with consults, notes, and reports."}
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-pink-600 hover:bg-pink-700 rounded-xl gap-2"
              data-testid="button-empty-add"
            >
              <Plus className="w-4 h-4" />
              Add your first record
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByMonth).map(([monthYear, monthRecords], groupIndex) => (
              <div key={monthYear}>
                {/* Month Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-zinc-900" data-testid={`month-header-${groupIndex}`}>
                      {monthYear}
                    </p>
                    <p className="text-[11px] text-zinc-500">{monthRecords.length} record{monthRecords.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Timeline with Line */}
                <div className="relative pl-5 border-l-2 border-pink-200 ml-5 space-y-3">
                  <AnimatePresence>
                    {monthRecords.map((record, index) => {
                      const Icon = getTypeIconComponent(record.type, record.category);
                      const gradientBg = getTypeGradient(record.type, record.category);
                      const borderClass = getTypeBorder(record.type);
                      const typeInfo = recordTypeInfo[record.type];
                      
                      return (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative"
                        >
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[25px] w-4 h-4 rounded-full ${gradientBg} border-2 border-white shadow-sm`} />
                          
                          <Card 
                            className={`bg-white border ${borderClass} rounded-2xl overflow-hidden hover:shadow-md transition-shadow`}
                            data-testid={`record-${record.id}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                {/* Icon */}
                                <div className={`w-10 h-10 ${gradientBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="text-[14px] font-semibold text-zinc-800 leading-tight">
                                      {record.title}
                                    </h3>
                                    <Badge 
                                      className={`text-[10px] px-2 py-0.5 flex-shrink-0 ${typeInfo.bg} ${typeInfo.textColor} hover:${typeInfo.bg}`}
                                    >
                                      {typeInfo.label.replace(/s$/, '')}
                                    </Badge>
                                  </div>
                                  <p className="text-[12px] text-zinc-500 line-clamp-2 leading-relaxed mb-2">
                                    {record.description}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 font-medium">
                                    {format(parseISO(record.date), "MMM d, yyyy")}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        onClick={() => setShowAddDialog(true)}
        className="absolute bottom-6 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 z-50"
        data-testid="button-floating-add"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Add Record Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-[360px] rounded-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-record">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-pink-600" />
              Add Record
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-500">
              Log a consult, note, or report
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2 space-y-4">
            {/* Record Type Selection */}
            <div>
              <label className="text-[13px] font-medium text-zinc-700 mb-2 block">Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewRecordType("consult")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    newRecordType === "consult"
                      ? "border-pink-500 bg-pink-50"
                      : "border-zinc-200 bg-white hover:bg-zinc-50"
                  }`}
                  data-testid="type-consult"
                >
                  <Heart className={`w-5 h-5 ${newRecordType === "consult" ? "text-pink-600" : "text-zinc-400"}`} />
                  <span className={`text-[12px] font-medium ${newRecordType === "consult" ? "text-pink-700" : "text-zinc-600"}`}>
                    Consult
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewRecordType("note")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    newRecordType === "note"
                      ? "border-amber-500 bg-amber-50"
                      : "border-zinc-200 bg-white hover:bg-zinc-50"
                  }`}
                  data-testid="type-note"
                >
                  <StickyNote className={`w-5 h-5 ${newRecordType === "note" ? "text-amber-600" : "text-zinc-400"}`} />
                  <span className={`text-[12px] font-medium ${newRecordType === "note" ? "text-amber-700" : "text-zinc-600"}`}>
                    Note
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewRecordType("report")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    newRecordType === "report"
                      ? "border-violet-500 bg-violet-50"
                      : "border-zinc-200 bg-white hover:bg-zinc-50"
                  }`}
                  data-testid="type-report"
                >
                  <FileText className={`w-5 h-5 ${newRecordType === "report" ? "text-violet-600" : "text-zinc-400"}`} />
                  <span className={`text-[12px] font-medium ${newRecordType === "report" ? "text-violet-700" : "text-zinc-600"}`}>
                    Report
                  </span>
                </button>
              </div>
            </div>

            {/* Consult Category (only shown for consult type) */}
            {newRecordType === "consult" && (
              <div>
                <label className="text-[13px] font-medium text-zinc-700 mb-2 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRecordCategory("lactation")}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                      newRecordCategory === "lactation"
                        ? "border-blue-500 bg-blue-50"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    }`}
                    data-testid="category-lactation"
                  >
                    <Milk className={`w-4 h-4 ${newRecordCategory === "lactation" ? "text-blue-600" : "text-zinc-400"}`} />
                    <span className={`text-[12px] font-medium ${newRecordCategory === "lactation" ? "text-blue-700" : "text-zinc-600"}`}>
                      Lactation
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRecordCategory("physio")}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                      newRecordCategory === "physio"
                        ? "border-green-500 bg-green-50"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    }`}
                    data-testid="category-physio"
                  >
                    <Dumbbell className={`w-4 h-4 ${newRecordCategory === "physio" ? "text-green-600" : "text-zinc-400"}`} />
                    <span className={`text-[12px] font-medium ${newRecordCategory === "physio" ? "text-green-700" : "text-zinc-600"}`}>
                      Physio
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRecordCategory("mental")}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                      newRecordCategory === "mental"
                        ? "border-purple-500 bg-purple-50"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    }`}
                    data-testid="category-mental"
                  >
                    <Brain className={`w-4 h-4 ${newRecordCategory === "mental" ? "text-purple-600" : "text-zinc-400"}`} />
                    <span className={`text-[12px] font-medium ${newRecordCategory === "mental" ? "text-purple-700" : "text-zinc-600"}`}>
                      Mental
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRecordCategory("general")}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                      newRecordCategory === "general"
                        ? "border-pink-500 bg-pink-50"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    }`}
                    data-testid="category-general"
                  >
                    <Heart className={`w-4 h-4 ${newRecordCategory === "general" ? "text-pink-600" : "text-zinc-400"}`} />
                    <span className={`text-[12px] font-medium ${newRecordCategory === "general" ? "text-pink-700" : "text-zinc-600"}`}>
                      General
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Title Input */}
            <div>
              <label className="text-[13px] font-medium text-zinc-700 mb-2 block">Title</label>
              <input
                type="text"
                value={newRecordTitle}
                onChange={(e) => setNewRecordTitle(e.target.value)}
                placeholder={
                  newRecordType === "consult" 
                    ? "e.g., Lactation consultation" 
                    : newRecordType === "note"
                    ? "e.g., Feeling better today"
                    : "e.g., Blood test results"
                }
                className="w-full bg-zinc-100 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-pink-300"
                data-testid="input-title"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="text-[13px] font-medium text-zinc-700 mb-2 block">
                Description <span className="text-zinc-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={newRecordDescription}
                onChange={(e) => setNewRecordDescription(e.target.value)}
                placeholder="Add any notes or details..."
                rows={3}
                className="w-full bg-zinc-100 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                data-testid="input-description"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}
              className="flex-1 rounded-xl"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRecord}
              className="flex-1 bg-pink-600 hover:bg-pink-700 rounded-xl"
              data-testid="button-save-record"
            >
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
