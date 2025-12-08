import { useState, useRef, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Syringe, 
  Check, 
  Clock, 
  Upload,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Camera,
  FileText,
  Bell,
  BellOff,
  Phone,
  Info,
  ChevronRight,
  Shield,
  Heart,
  Star,
  Sparkles,
  Building2,
  Calendar,
  Navigation,
  Gift,
  X,
  Settings,
  Stethoscope
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BabyProfile, Vaccine } from "@shared/schema";
import { format, differenceInDays, isPast, isToday, addDays } from "date-fns";
import VaccineCelebration from "@/components/VaccineCelebration";
import { getVaccineInfo, VACCINE_MESSAGES, MOCK_HOSPITALS, type PartnerHospital } from "@/lib/vaccineData";
import { getReminderSettings, setReminderSettings, isVaccineReminderEnabled, toggleVaccineReminder } from "@/lib/reminderStore";
import { getActivePlans, hasChildPlan } from "@/lib/planStore";

function getVaccineStatus(vaccine: Vaccine): { label: string; variant: "done" | "upcoming" | "overdue" | "due-soon" } {
  if (vaccine.status === "completed") {
    return { label: "Done", variant: "done" };
  }
  
  if (vaccine.dueDate) {
    const dueDate = new Date(vaccine.dueDate);
    const daysUntil = differenceInDays(dueDate, new Date());
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return { label: "Overdue", variant: "overdue" };
    }
    if (daysUntil <= 7) {
      return { label: "Due soon", variant: "due-soon" };
    }
  }
  
  return { label: "Upcoming", variant: "upcoming" };
}

function getStatusStyles(variant: "done" | "upcoming" | "overdue" | "due-soon") {
  switch (variant) {
    case "done":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "overdue":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "due-soon":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "upcoming":
      return "bg-sky-100 text-sky-700 border-sky-200";
  }
}

function getVaccineIcon(iconType: "shield" | "star" | "heart" | "sparkles") {
  switch (iconType) {
    case "shield":
      return <Shield className="w-5 h-5" />;
    case "star":
      return <Star className="w-5 h-5" />;
    case "heart":
      return <Heart className="w-5 h-5" />;
    case "sparkles":
      return <Sparkles className="w-5 h-5" />;
  }
}

interface CelebrationData {
  vaccineName: string;
  ageGroup: string;
  completedDate: string;
}

export default function BabyCareVaccines() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const babyId = params.babyId;
  const { toast } = useToast();
  
  // Dialog states
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [showVaccineInfo, setShowVaccineInfo] = useState(false);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showHospitalSearch, setShowHospitalSearch] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  
  // Form states
  const [completionDate, setCompletionDate] = useState("");
  const [place, setPlace] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<PartnerHospital | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  
  // Reminder settings state
  const [reminderSettings, setLocalReminderSettings] = useState(getReminderSettings);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if user has vaccine pack
  const plans = getActivePlans();
  const hasVaccinePack = plans.childPlan === "vaccination" || plans.childPlan === "premium" || 
                         plans.comboPlan === "essential" || plans.comboPlan === "premium";

  const { data: profiles = [] } = useQuery<BabyProfile[]>({
    queryKey: ["/api/baby-profiles"],
  });

  const baby = profiles.find(p => p.id === babyId);

  const { data: vaccines = [], isLoading } = useQuery<Vaccine[]>({
    queryKey: ["/api/baby-profiles", babyId, "vaccines"],
    enabled: !!babyId,
  });

  // Handle openHospital query param from home page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const openHospitalId = urlParams.get('openHospital');
    if (openHospitalId && vaccines.length > 0) {
      const vaccine = vaccines.find(v => v.id === openHospitalId);
      if (vaccine) {
        setSelectedVaccine(vaccine);
        setShowHospitalSearch(true);
        // Clear the query param
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [vaccines]);

  const markComplete = useMutation({
    mutationFn: async ({ id, date, place, vaccineName, ageGroup }: { 
      id: string; 
      date: string; 
      place?: string;
      vaccineName: string;
      ageGroup: string;
    }) => {
      const response = await apiRequest("PATCH", `/api/vaccines/${id}`, {
        status: "completed",
        completedDate: date,
        place: place || undefined,
      });
      return { vaccineName, ageGroup, date };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/baby-profiles", babyId, "vaccines"] });
      setCelebrationData({
        vaccineName: data.vaccineName,
        ageGroup: data.ageGroup,
        completedDate: data.date,
      });
      setShowLogDialog(false);
      setSelectedVaccine(null);
      setCompletionDate("");
      setPlace("");
      setSelectedFile(null);
    },
  });

  const groupedVaccines = vaccines.reduce((acc, vaccine) => {
    if (!acc[vaccine.ageGroup]) {
      acc[vaccine.ageGroup] = [];
    }
    acc[vaccine.ageGroup].push(vaccine);
    return acc;
  }, {} as Record<string, Vaccine[]>);

  const ageGroupOrder = [
    "Birth", "6 Weeks", "10 Weeks", "14 Weeks", "9-12 Months",
    "6 Months", "9 Months", "12 Months", "15 Months", "16-18 Months", "18 Months", "4-6 Years"
  ];

  const orderedGroups = ageGroupOrder.filter(group => groupedVaccines[group]);

  const handleSave = () => {
    if (selectedVaccine && completionDate) {
      markComplete.mutate({ 
        id: selectedVaccine.id, 
        date: completionDate, 
        place,
        vaccineName: selectedVaccine.name,
        ageGroup: selectedVaccine.ageGroup,
      });
    }
  };

  const handleCloseCelebration = () => {
    setCelebrationData(null);
    setLocation(`/babycare/home/${babyId}`);
  };

  const handleViewSchedule = () => {
    setCelebrationData(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const openVaccineInfo = (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    setShowVaccineInfo(true);
  };

  const openLogDialog = (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    setCompletionDate(new Date().toISOString().split('T')[0]);
    setPlace("");
    setSelectedFile(null);
    setShowLogDialog(true);
  };

  const openHospitalSearch = (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    setShowHospitalSearch(true);
  };

  const openBooking = (hospital: PartnerHospital) => {
    setSelectedHospital(hospital);
    setSelectedDate(addDays(new Date(), 1).toISOString().split('T')[0]);
    setSelectedSlot("");
    setShowHospitalSearch(false);
    setShowBookingDialog(true);
  };

  const handleBookingConfirm = () => {
    // Guard: ensure date and slot are selected
    if (!selectedDate || !selectedSlot || !selectedHospital || !selectedVaccine) {
      toast({
        title: "Please select a date and time",
        description: "Both date and time slot are required to book an appointment.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Booking confirmed!",
      description: `${selectedVaccine.name} at ${selectedHospital.name} on ${format(new Date(selectedDate), "MMM d, yyyy")} at ${selectedSlot}`,
    });
    setShowBookingDialog(false);
    setSelectedHospital(null);
    setSelectedVaccine(null);
    setSelectedDate("");
    setSelectedSlot("");
  };

  const updateReminderSettings = (updates: Partial<typeof reminderSettings>) => {
    const newSettings = { ...reminderSettings, ...updates };
    setLocalReminderSettings(newSettings);
    setReminderSettings(newSettings);
  };

  if (!baby) {
    return (
      <div className="app-container min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500" data-testid="text-baby-not-found">Baby not found</p>
      </div>
    );
  }

  // Calculate due/overdue vaccines
  const pendingVaccines = vaccines.filter(v => v.status === "pending");
  const overdueVaccines = pendingVaccines.filter(v => {
    if (!v.dueDate) return false;
    const dueDate = new Date(v.dueDate);
    return isPast(dueDate) && !isToday(dueDate);
  });
  const upcomingVaccines = pendingVaccines.filter(v => {
    if (!v.dueDate) return true;
    const dueDate = new Date(v.dueDate);
    return !isPast(dueDate) || isToday(dueDate);
  });
  const overdueCount = overdueVaccines.length;
  const upcomingCount = upcomingVaccines.length;
  const isUpToDate = pendingVaccines.length === 0;
  const completedCount = vaccines.filter(v => v.status === "completed").length;

  return (
    <div className="app-container bg-gradient-to-b from-violet-50 to-white min-h-screen flex flex-col">
      {/* Happy Header with Gradient */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href={`/babycare/home/${babyId}`}>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-[18px] font-bold" data-testid="text-title">Vaccine schedule</h1>
              <p className="text-[13px] text-white/70">{baby.name}'s immunization tracker</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full h-10 w-10"
            onClick={() => setShowReminderSettings(true)}
            data-testid="button-reminder-settings"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Ring */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="white"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(completedCount / vaccines.length) * 176} 176`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[14px] font-bold">{Math.round((completedCount / vaccines.length) * 100)}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-semibold">
              {isUpToDate ? "All caught up!" : overdueCount > 0 ? `${overdueCount} overdue` : `${upcomingCount} upcoming`}
            </p>
            <p className="text-[13px] text-white/70">
              {completedCount} of {vaccines.length} vaccines complete
            </p>
            {!isUpToDate && (
              <div className="mt-2 flex gap-2">
                {overdueCount > 0 && (
                  <Badge className="bg-rose-500/30 text-white border-rose-400/50 text-[11px]">
                    {overdueCount} overdue
                  </Badge>
                )}
                {upcomingCount > 0 && (
                  <Badge className="bg-emerald-500/30 text-white border-emerald-400/50 text-[11px]">
                    {upcomingCount} upcoming
                  </Badge>
                )}
              </div>
            )}
          </div>
          {isUpToDate && (
            <div className="text-4xl">🎉</div>
          )}
        </div>

        {/* Reminder Banner */}
        {reminderSettings.globalRemindersEnabled && !isUpToDate && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-amber-400/20 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-300" />
            </div>
            <p className="text-[12px] text-white/90 flex-1">
              Reminders enabled! We'll notify you 2 days before each due date.
            </p>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8 px-4 pt-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" data-testid="loading-spinner" />
          </div>
        ) : (
          <div className="space-y-6">
            {orderedGroups.map((ageGroup) => {
              const groupVaccines = groupedVaccines[ageGroup];
              const groupCompletedCount = groupVaccines.filter(v => v.status === "completed").length;
              const allComplete = groupCompletedCount === groupVaccines.length;

              return (
                <motion.div 
                  key={ageGroup} 
                  data-testid={`vaccine-group-${ageGroup.replace(/\s+/g, "-")}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Age Group Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        allComplete 
                          ? "bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-200/50" 
                          : "bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-violet-200/50"
                      }`}>
                        {allComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <Syringe className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-zinc-900">{ageGroup}</h3>
                        <p className="text-[12px] text-zinc-500">
                          {groupCompletedCount === groupVaccines.length 
                            ? "All done! Great job!" 
                            : `${groupVaccines.length - groupCompletedCount} remaining`}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-[12px] font-semibold ${
                      allComplete 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-violet-100 text-violet-700"
                    }`}>
                      {groupCompletedCount}/{groupVaccines.length}
                    </div>
                  </div>

                  {/* Vaccines List */}
                  <div className="space-y-3">
                    {groupVaccines.map((vaccine) => {
                      const status = getVaccineStatus(vaccine);
                      const vaccineInfo = getVaccineInfo(vaccine.name);
                      const daysUntilDue = vaccine.dueDate 
                        ? differenceInDays(new Date(vaccine.dueDate), new Date())
                        : null;
                      
                      return (
                        <motion.div
                          key={vaccine.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Card 
                            className={`border-0 shadow-md overflow-hidden ${
                              status.variant === "done" 
                                ? "bg-gradient-to-r from-emerald-50 to-white" 
                                : status.variant === "overdue"
                                  ? "bg-gradient-to-r from-rose-50 to-white"
                                  : status.variant === "due-soon"
                                    ? "bg-gradient-to-r from-amber-50 to-white"
                                    : "bg-white"
                            }`}
                            data-testid={`vaccine-card-${vaccine.id}`}
                          >
                            <CardContent className="p-0">
                              {/* Main Row - Clickable for info */}
                              <button
                                onClick={() => openVaccineInfo(vaccine)}
                                className="w-full p-4 text-left"
                                data-testid={`button-info-${vaccine.id}`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Icon */}
                                  <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center ${
                                    status.variant === "done" 
                                      ? "bg-gradient-to-br from-emerald-400 to-green-500" 
                                      : status.variant === "overdue"
                                        ? "bg-gradient-to-br from-rose-400 to-red-500"
                                        : status.variant === "due-soon"
                                          ? "bg-gradient-to-br from-amber-400 to-orange-500"
                                          : "bg-gradient-to-br from-violet-400 to-purple-500"
                                  }`}>
                                    {status.variant === "done" ? (
                                      <Check className="w-5 h-5 text-white" />
                                    ) : (
                                      <span className="text-white">{getVaccineIcon(vaccineInfo.icon)}</span>
                                    )}
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <p className="text-[15px] font-semibold text-zinc-900" data-testid={`vaccine-name-${vaccine.id}`}>
                                          {vaccine.name}
                                        </p>
                                        <p className="text-[12px] text-zinc-500 mt-0.5 line-clamp-1">
                                          {vaccineInfo.tagline}
                                        </p>
                                      </div>
                                      <ChevronRight className="w-5 h-5 text-zinc-300 flex-shrink-0" />
                                    </div>
                                    
                                    {/* Date & Status Row */}
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      {vaccine.status === "completed" && vaccine.completedDate ? (
                                        <span className="text-[12px] text-emerald-600 font-medium flex items-center gap-1">
                                          <Check className="w-3.5 h-3.5" />
                                          Given {format(new Date(vaccine.completedDate), "MMM d, yyyy")}
                                        </span>
                                      ) : vaccine.dueDate ? (
                                        <span className={`text-[12px] font-medium flex items-center gap-1 ${
                                          status.variant === "overdue" ? "text-rose-600" : 
                                          status.variant === "due-soon" ? "text-amber-600" : "text-zinc-500"
                                        }`}>
                                          <Clock className="w-3.5 h-3.5" />
                                          {daysUntilDue === 0 ? "Due today" : 
                                           daysUntilDue === 1 ? "Due tomorrow" :
                                           daysUntilDue && daysUntilDue > 0 ? `Due in ${daysUntilDue} days` :
                                           `${Math.abs(daysUntilDue || 0)} days overdue`}
                                        </span>
                                      ) : null}
                                      
                                      <Badge 
                                        className={`text-[10px] px-2 py-0.5 ${getStatusStyles(status.variant)}`}
                                        data-testid={`badge-status-${vaccine.id}`}
                                      >
                                        {status.label}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </button>
                              
                              {/* Action Buttons - Only for pending vaccines */}
                              {vaccine.status === "pending" && (
                                <div className="px-4 pb-4 pt-0 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-[12px] rounded-xl h-9 border-violet-200 text-violet-600 hover:bg-violet-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openHospitalSearch(vaccine);
                                    }}
                                    data-testid={`button-book-${vaccine.id}`}
                                  >
                                    <Building2 className="w-3.5 h-3.5 mr-1.5" />
                                    Find hospital
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 text-[12px] rounded-xl h-9 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLogDialog(vaccine);
                                    }}
                                    data-testid={`button-mark-${vaccine.id}`}
                                  >
                                    <Check className="w-3.5 h-3.5 mr-1.5" />
                                    Mark done
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vaccine Info Sheet */}
      <Dialog open={showVaccineInfo} onOpenChange={setShowVaccineInfo}>
        <DialogContent className="max-w-[380px] max-h-[90vh] rounded-2xl p-0 overflow-hidden" data-testid="dialog-vaccine-info">
          {selectedVaccine && (() => {
            const info = getVaccineInfo(selectedVaccine.name);
            const status = getVaccineStatus(selectedVaccine);
            
            return (
              <>
                {/* Header */}
                <div className={`p-5 pb-4 ${
                  status.variant === "done" 
                    ? "bg-gradient-to-br from-emerald-500 to-green-600" 
                    : "bg-gradient-to-br from-violet-500 to-purple-600"
                } text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        {getVaccineIcon(info.icon)}
                      </div>
                      <div>
                        <h2 className="text-[18px] font-bold">{selectedVaccine.name}</h2>
                        <p className="text-[13px] text-white/80">{selectedVaccine.ageGroup}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
                      onClick={() => setShowVaccineInfo(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-[14px] text-white/90 mt-3">{info.tagline}</p>
                </div>
                
                {/* Tabs Content */}
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 bg-zinc-100 p-1 mx-4 mt-4 rounded-xl" style={{width: 'calc(100% - 32px)'}}>
                    <TabsTrigger value="about" className="text-[12px] rounded-lg data-[state=active]:bg-white">About</TabsTrigger>
                    <TabsTrigger value="benefits" className="text-[12px] rounded-lg data-[state=active]:bg-white">Benefits</TabsTrigger>
                    <TabsTrigger value="safety" className="text-[12px] rounded-lg data-[state=active]:bg-white">Safety</TabsTrigger>
                  </TabsList>
                  
                  <div className="p-4 max-h-[50vh] overflow-y-auto">
                    <TabsContent value="about" className="mt-0 space-y-4">
                      <div>
                        <h4 className="text-[14px] font-semibold text-zinc-900 mb-2">Why this vaccine matters</h4>
                        <p className="text-[13px] text-zinc-600 leading-relaxed">{info.importance}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-[14px] font-semibold text-zinc-900 mb-2">Protects against</h4>
                        <div className="flex flex-wrap gap-2">
                          {info.protectsAgainst.map((disease, i) => (
                            <Badge key={i} variant="secondary" className="bg-violet-100 text-violet-700 text-[11px]">
                              {disease}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {info.funFact && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                          <p className="text-[12px] text-amber-800 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{info.funFact}</span>
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="benefits" className="mt-0 space-y-3">
                      <h4 className="text-[14px] font-semibold text-zinc-900">Key benefits</h4>
                      {info.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <p className="text-[13px] text-zinc-700">{benefit}</p>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="safety" className="mt-0 space-y-4">
                      <div>
                        <h4 className="text-[14px] font-semibold text-zinc-900 mb-2">Common side effects</h4>
                        <p className="text-[12px] text-zinc-500 mb-2">These are normal and usually go away in 1-2 days:</p>
                        <div className="space-y-2">
                          {info.commonSideEffects.map((effect, i) => (
                            <div key={i} className="flex items-center gap-2 text-[13px] text-zinc-600">
                              <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full" />
                              {effect}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                        <h4 className="text-[13px] font-semibold text-rose-800 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          When to call your doctor
                        </h4>
                        <div className="space-y-1">
                          {info.whenToSeekHelp.map((item, i) => (
                            <p key={i} className="text-[12px] text-rose-700 flex items-start gap-2">
                              <span>•</span>
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
                
                {/* Footer Actions */}
                {selectedVaccine.status === "pending" && (
                  <div className="p-4 border-t border-zinc-100 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-11"
                      onClick={() => {
                        setShowVaccineInfo(false);
                        openHospitalSearch(selectedVaccine);
                      }}
                      data-testid="button-find-hospital-info"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Find hospital
                    </Button>
                    <Button
                      className="flex-1 rounded-xl h-11 bg-gradient-to-r from-violet-500 to-purple-600"
                      onClick={() => {
                        setShowVaccineInfo(false);
                        openLogDialog(selectedVaccine);
                      }}
                      data-testid="button-mark-done-info"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark done
                    </Button>
                  </div>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Log Vaccine Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-[340px] rounded-2xl" data-testid="dialog-log-vaccine">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              Log vaccine
            </DialogTitle>
            <DialogDescription className="sr-only">
              Record vaccination details for {selectedVaccine?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Vaccine Info */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
              <p className="text-[15px] font-semibold text-zinc-900" data-testid="dialog-vaccine-name">{selectedVaccine?.name}</p>
              <p className="text-[13px] text-zinc-500">{selectedVaccine?.ageGroup}</p>
            </div>

            {/* Date Given */}
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-zinc-700">Date given</Label>
              <Input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="h-12 rounded-xl"
                data-testid="input-date-given"
              />
            </div>

            {/* Place (Optional) */}
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-zinc-700">
                Place <span className="font-normal text-zinc-400">(optional)</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Hospital or clinic name"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="h-12 rounded-xl pl-10"
                  data-testid="input-place"
                />
              </div>
            </div>

            {/* Upload Slip/Photo */}
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-zinc-700">
                Upload slip/photo <span className="font-normal text-zinc-400">(optional)</span>
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileSelect}
                data-testid="input-file"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl border-dashed border-2 text-zinc-500 hover:bg-zinc-50"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-upload"
              >
                {selectedFile ? (
                  <span className="flex items-center gap-2 text-violet-600">
                    <FileText className="w-4 h-4" />
                    {selectedFile.name}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Choose file or take photo
                  </span>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogDialog(false)}
              className="flex-1 rounded-xl h-11"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!completionDate || markComplete.isPending}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl h-11"
              data-testid="button-save"
            >
              {markComplete.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hospital Search Dialog */}
      <Dialog open={showHospitalSearch} onOpenChange={setShowHospitalSearch}>
        <DialogContent className="max-w-[380px] max-h-[85vh] rounded-2xl p-0 overflow-hidden" data-testid="dialog-hospital-search">
          <DialogHeader className="sr-only">
            <DialogTitle>Find a hospital</DialogTitle>
            <DialogDescription>Search for nearby hospitals to get the vaccine administered</DialogDescription>
          </DialogHeader>
          {/* Header */}
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[18px] font-bold">Find a hospital</h2>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
                onClick={() => setShowHospitalSearch(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {selectedVaccine && (
              <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                <Syringe className="w-5 h-5" />
                <div>
                  <p className="text-[14px] font-semibold">{selectedVaccine.name}</p>
                  <p className="text-[12px] text-white/70">{selectedVaccine.ageGroup}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Hospital List */}
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
            {/* Pack holder banner */}
            {hasVaccinePack ? (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <span className="text-[13px] font-semibold text-emerald-800">You have a vaccine pack!</span>
                </div>
                <p className="text-[12px] text-emerald-700">Walk in at any partner hospital below - no payment needed.</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-amber-600" />
                  <span className="text-[13px] font-semibold text-amber-800">Book and get a free pediatric visit!</span>
                </div>
                <p className="text-[12px] text-amber-700">Pay online and get a complimentary checkup with your vaccine.</p>
              </div>
            )}
            
            {MOCK_HOSPITALS.map((hospital) => (
              <Card 
                key={hospital.id}
                className="border border-zinc-100 overflow-hidden hover:shadow-md transition-shadow"
                data-testid={`hospital-card-${hospital.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-semibold text-zinc-900">{hospital.name}</h3>
                        {hospital.isPartner && (
                          <Badge className="bg-violet-100 text-violet-700 text-[10px] px-1.5">Partner</Badge>
                        )}
                      </div>
                      <p className="text-[12px] text-zinc-500 mt-0.5">{hospital.address}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[12px] text-zinc-600 flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {hospital.distance}
                        </span>
                        <span className="text-[12px] text-amber-600 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {hospital.rating}
                        </span>
                      </div>
                      
                      {!hasVaccinePack && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-zinc-900">₹{hospital.vaccinePrice}</span>
                          <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            + Free pediatric visit
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      className={`rounded-xl h-9 px-4 ${
                        hasVaccinePack 
                          ? "bg-emerald-500 hover:bg-emerald-600" 
                          : "bg-violet-500 hover:bg-violet-600"
                      }`}
                      onClick={() => openBooking(hospital)}
                      data-testid={`button-select-hospital-${hospital.id}`}
                    >
                      {hasVaccinePack ? "Walk in" : "Book"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-[340px] rounded-2xl" data-testid="dialog-booking">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-500" />
              {hasVaccinePack ? "Schedule walk-in" : "Book appointment"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Select a date and time slot to book your vaccine appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedHospital && (
            <div className="py-4 space-y-4">
              {/* Hospital Info */}
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="text-[15px] font-semibold text-zinc-900">{selectedHospital.name}</p>
                <p className="text-[13px] text-zinc-500">{selectedHospital.address}</p>
              </div>
              
              {/* Vaccine Info */}
              <div className="bg-violet-50 rounded-xl p-4">
                <p className="text-[14px] font-semibold text-zinc-900">{selectedVaccine?.name}</p>
                {!hasVaccinePack && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[14px] font-bold text-violet-600">₹{selectedHospital.vaccinePrice}</span>
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">+ Free checkup</Badge>
                  </div>
                )}
              </div>
              
              {/* Date Selection */}
              <div className="space-y-2">
                <Label className="text-[14px] font-semibold text-zinc-700">Select date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  min={addDays(new Date(), 1).toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-12 rounded-xl"
                  data-testid="input-booking-date"
                />
              </div>
              
              {/* Slot Selection */}
              <div className="space-y-2">
                <Label className="text-[14px] font-semibold text-zinc-700">Select time slot</Label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedHospital.availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedSlot === slot ? "default" : "outline"}
                      className={`h-10 rounded-xl text-[13px] ${
                        selectedSlot === slot 
                          ? "bg-violet-500 hover:bg-violet-600 text-white" 
                          : "border-zinc-200 hover:bg-zinc-50"
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                      data-testid={`button-slot-${slot.replace(/\s+/g, "-")}`}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Reminder Note */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                <Bell className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-700">
                  We'll send you a reminder 2 days before and on the day of your appointment.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
              className="flex-1 rounded-xl h-11"
              data-testid="button-cancel-booking"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookingConfirm}
              disabled={!selectedDate || !selectedSlot}
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl h-11"
              data-testid="button-confirm-booking"
            >
              {hasVaccinePack ? "Confirm" : `Pay ₹${selectedHospital?.vaccinePrice}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Settings Dialog */}
      <Dialog open={showReminderSettings} onOpenChange={setShowReminderSettings}>
        <DialogContent className="max-w-[340px] rounded-2xl" data-testid="dialog-reminder-settings">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-500" />
              Reminder settings
            </DialogTitle>
            <DialogDescription className="sr-only">
              Configure how you want to receive vaccine reminders
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-5">
            {/* Global Reminders Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-zinc-900">Enable reminders</p>
                  <p className="text-[12px] text-zinc-500">Get notified before due dates</p>
                </div>
              </div>
              <Switch
                checked={reminderSettings.globalRemindersEnabled}
                onCheckedChange={(checked) => updateReminderSettings({ globalRemindersEnabled: checked })}
                data-testid="switch-global-reminders"
              />
            </div>
            
            <div className={`space-y-4 ${!reminderSettings.globalRemindersEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Notification Type */}
              <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                <p className="text-[13px] font-semibold text-zinc-700">Notification type</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-zinc-500" />
                    <span className="text-[14px] text-zinc-700">Push notifications</span>
                  </div>
                  <Switch
                    checked={reminderSettings.notificationRemindersEnabled}
                    onCheckedChange={(checked) => updateReminderSettings({ notificationRemindersEnabled: checked })}
                    data-testid="switch-notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-zinc-500" />
                    <span className="text-[14px] text-zinc-700">Phone call reminder</span>
                  </div>
                  <Switch
                    checked={reminderSettings.callRemindersEnabled}
                    onCheckedChange={(checked) => updateReminderSettings({ callRemindersEnabled: checked })}
                    data-testid="switch-calls"
                  />
                </div>
              </div>
              
              {/* Timing */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-[13px] font-semibold text-amber-800">Reminder timing</span>
                </div>
                <p className="text-[12px] text-amber-700">
                  You'll receive reminders <span className="font-semibold">2 days before</span> the due date, 
                  and again on the day of the vaccine.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowReminderSettings(false)}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl h-11"
              data-testid="button-save-reminders"
            >
              Save settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Celebration Screen */}
      {baby && celebrationData && (
        <VaccineCelebration
          isOpen={!!celebrationData}
          onClose={handleCloseCelebration}
          onViewSchedule={handleViewSchedule}
          babyName={baby.name}
          vaccineName={celebrationData.vaccineName}
          ageGroup={celebrationData.ageGroup}
          completedDate={celebrationData.completedDate}
        />
      )}
    </div>
  );
}
