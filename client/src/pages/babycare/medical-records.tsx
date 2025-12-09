import { useState, useMemo } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  Syringe,
  TrendingUp,
  Stethoscope,
  FileText,
  Paperclip,
  ClipboardList,
  Star,
  Plus,
  Upload,
  Calendar,
  Clock,
  Heart,
  Activity,
  FileCheck,
  Download,
  Eye,
  Camera,
  Sparkles,
  Shield,
  Brain,
  MessageCircle,
  ChevronRight,
  FolderOpen,
  FilePlus,
  Image,
  File,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Vaccine, GrowthEntry, Milestone } from "@shared/schema";
import {
  getMedicalRecordsByProfileId,
  createMedicalRecord,
  type MedicalRecord,
} from "@/lib/medicalRecordsApi";
import {
  format,
  parseISO,
  differenceInDays,
  differenceInMonths,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { MiraFab } from "@/components/MiraFab";
import { getProfiles, type Profile } from "@/lib/profileApi";
import { getUserId } from "@/lib/userId";

type RecordType = "vaccine" | "growth" | "milestone" | "visit" | "report";
type FilterType = "all" | RecordType;

interface Attachment {
  url: string;
  fileName?: string;
}

interface TimelineRecord {
  id: string;
  date: Date;
  type: RecordType;
  title: string;
  detail: string;
  attachments?: Attachment[];
  additionalInfo?: string;
}

const recordTypeInfo = {
  vaccine: {
    label: "Vaccines",
    icon: Syringe,
    gradient: "from-blue-400 to-cyan-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    iconBg: "bg-gradient-to-br from-blue-400 to-cyan-500",
    textColor: "text-blue-700",
  },
  growth: {
    label: "Growth",
    icon: TrendingUp,
    gradient: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    textColor: "text-emerald-700",
  },
  milestone: {
    label: "Milestones",
    icon: Star,
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    textColor: "text-amber-700",
  },
  visit: {
    label: "Visits",
    icon: Stethoscope,
    gradient: "from-violet-400 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
    iconBg: "bg-gradient-to-br from-violet-400 to-purple-500",
    textColor: "text-violet-700",
  },
  report: {
    label: "Reports",
    icon: FileText,
    gradient: "from-rose-400 to-pink-500",
    bg: "bg-rose-50",
    border: "border-rose-100",
    iconBg: "bg-gradient-to-br from-rose-400 to-pink-500",
    textColor: "text-rose-700",
  },
};

const reportTypeLabels: Record<
  string,
  { label: string; icon: typeof FileText }
> = {
  prescription: { label: "Prescription", icon: FileCheck },
  lab_result: { label: "Lab Result", icon: Activity },
  scan: { label: "Scan / X-Ray", icon: Image },
  vaccination_record: { label: "Vaccination Record", icon: Syringe },
  discharge_summary: { label: "Discharge Summary", icon: ClipboardList },
  birth_certificate: { label: "Birth Certificate", icon: Heart },
  other: { label: "Other Document", icon: File },
};

export default function BabyCareMedicalRecords() {
  const params = useParams();
  const babyId = params.babyId;
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [viewingReport, setViewingReport] = useState<MedicalRecord | null>(
    null,
  );

  const [visitForm, setVisitForm] = useState({
    recordDate: new Date().toISOString().split("T")[0],
    title: "",
    doctorName: "",
    hospitalName: "",
    diagnosis: "",
    description: "",
    category: "visit",
    recordType: "visit",
    tags: [] as string[],
    files: [] as File[],
  });

  const [reportForm, setReportForm] = useState({
    recordDate: new Date().toISOString().split("T")[0],
    title: "",
    recordType: "report",
    category: "document",
    description: "",
    doctorName: "",
    hospitalName: "",
    diagnosis: "",
    tags: [] as string[],
    files: [] as File[],
  });

  // Fetch profiles from API
  const userId = getUserId();
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: [`/api/v1/profiles/user/${userId}`],
    queryFn: () => getProfiles(),
  });

  // Find baby profile - route param babyId is actually profileId
  const baby = profiles.find((p) => p.profileId === babyId);
  const babyProfileId = baby?.profileId || babyId; // Use profileId for navigation

  const { data: vaccines = [] } = useQuery<Vaccine[]>({
    queryKey: ["/api/baby-profiles", babyId, "vaccines"],
    enabled: !!babyId,
  });

  const { data: growthEntries = [] } = useQuery<GrowthEntry[]>({
    queryKey: ["/api/baby-profiles", babyId, "growth"],
    enabled: !!babyId,
  });

  const { data: milestones = [] } = useQuery<Milestone[]>({
    queryKey: ["/api/baby-profiles", babyId, "milestones"],
    enabled: !!babyId,
  });

  const { data: medicalRecords = [] } = useQuery<MedicalRecord[]>({
    queryKey: ["/api/v1/medical-records/profile", babyProfileId],
    queryFn: () => getMedicalRecordsByProfileId(babyProfileId as string),
    enabled: !!babyProfileId,
  });

  const createVisit = useMutation({
    mutationFn: async (data: typeof visitForm) => {
      return createMedicalRecord(
        {
          profileId: babyProfileId as string,
          recordType: data.recordType,
          category: data.category,
          recordDate: data.recordDate,
          title: data.title,
          description: data.description || null,
          doctorName: data.doctorName || null,
          hospitalName: data.hospitalName || null,
          diagnosis: data.diagnosis || null,
          tags: data.tags.length > 0 ? data.tags : null,
        },
        data.files.length > 0 ? data.files : null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/v1/medical-records/profile", babyProfileId],
      });
      toast({
        title: "Visit logged!",
        description: "Doctor visit has been added to your records.",
      });
      setShowVisitDialog(false);
      setVisitForm({
        recordDate: new Date().toISOString().split("T")[0],
        title: "",
        doctorName: "",
        hospitalName: "",
        diagnosis: "",
        description: "",
        category: "visit",
        recordType: "visit",
        tags: [],
        files: [],
      });
    },
  });

  const createReport = useMutation({
    mutationFn: async (data: typeof reportForm) => {
      return createMedicalRecord(
        {
          profileId: babyProfileId as string,
          recordType: data.recordType,
          category: data.category,
          recordDate: data.recordDate,
          title: data.title,
          description: data.description || null,
          doctorName: data.doctorName || null,
          hospitalName: data.hospitalName || null,
          diagnosis: data.diagnosis || null,
          tags: data.tags.length > 0 ? data.tags : null,
        },
        data.files.length > 0 ? data.files : null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/v1/medical-records/profile", babyProfileId],
      });
      toast({
        title: "Report saved!",
        description: "Medical report has been added to your records.",
      });
      setShowReportDialog(false);
      setReportForm({
        recordDate: new Date().toISOString().split("T")[0],
        title: "",
        recordType: "report",
        category: "document",
        description: "",
        doctorName: "",
        hospitalName: "",
        diagnosis: "",
        tags: [],
        files: [],
      });
    },
  });

  const timelineRecords = useMemo(() => {
    const records: TimelineRecord[] = [];

    vaccines
      .filter((v) => v.status === "completed" && v.completedDate)
      .forEach((vaccine) => {
        const attachments: Attachment[] = [];
        if (vaccine.proofUrl) {
          attachments.push({ url: vaccine.proofUrl });
        }
        records.push({
          id: `vaccine-${vaccine.id}`,
          date: parseISO(vaccine.completedDate!),
          type: "vaccine",
          title: vaccine.name,
          detail: `${vaccine.ageGroup} vaccination completed`,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
      });

    growthEntries.forEach((entry) => {
      const typeLabel =
        entry.type === "weight"
          ? "Weight"
          : entry.type === "height"
            ? "Height"
            : "Head circumference";
      const unit = entry.type === "weight" ? "kg" : "cm";
      records.push({
        id: `growth-${entry.id}`,
        date: parseISO(entry.recordedAt),
        type: "growth",
        title: `${typeLabel}: ${entry.value} ${unit}`,
        detail: entry.percentile
          ? `${entry.percentile}th percentile`
          : "Measurement recorded",
      });
    });

    milestones
      .filter((m) => m.completed && m.completedAt)
      .forEach((milestone) => {
        records.push({
          id: `milestone-${milestone.id}`,
          date: parseISO(milestone.completedAt!),
          type: "milestone",
          title: milestone.title,
          detail:
            milestone.description || `${milestone.ageGroup} milestone achieved`,
        });
      });

    // Map medical records to timeline records
    medicalRecords.forEach((record) => {
      // Build attachments array from fileUrls and fileAttachments
      const attachments: Attachment[] = [];
      if (record.fileAttachments && record.fileAttachments.length > 0) {
        // Use fileAttachments if available (has fileName)
        record.fileAttachments.forEach((file) => {
          attachments.push({
            url: file.fileUrl,
            fileName: file.fileName,
          });
        });
      } else if (record.fileUrls && record.fileUrls.length > 0) {
        // Fallback to fileUrls if fileAttachments not available
        // Extract filename from URL if possible
        record.fileUrls.forEach((url) => {
          const urlParts = url.split("/");
          const fileName = urlParts[urlParts.length - 1] || undefined;
          attachments.push({ url, fileName });
        });
      }

      if (record.recordType === "visit") {
        records.push({
          id: `visit-${record.recordId}`,
          date: parseISO(record.recordDate),
          type: "visit",
          title: record.title,
          detail: record.doctorName
            ? `Dr. ${record.doctorName}`
            : "Doctor visit",
          additionalInfo: record.hospitalName || undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
      } else if (record.recordType === "report") {
        const typeInfo =
          reportTypeLabels[record.category] || reportTypeLabels.other;
        records.push({
          id: `report-${record.recordId}`,
          date: parseISO(record.recordDate),
          type: "report",
          title: record.title,
          detail: typeInfo.label,
          attachments: attachments.length > 0 ? attachments : undefined,
          additionalInfo: record.description || undefined,
        });
      }
    });

    records.sort((a, b) => b.date.getTime() - a.date.getTime());
    return records;
  }, [vaccines, growthEntries, milestones, medicalRecords]);

  const filteredRecords = useMemo(() => {
    if (activeFilter === "all") return timelineRecords;
    return timelineRecords.filter((r) => r.type === activeFilter);
  }, [timelineRecords, activeFilter]);

  // Stats calculation
  const stats = useMemo(
    () => ({
      vaccines: vaccines.filter((v) => v.status === "completed").length,
      growth: growthEntries.length,
      milestones: milestones.filter((m) => m.completed).length,
      visits: medicalRecords.filter((r) => r.recordType === "visit").length,
      reports: medicalRecords.filter((r) => r.recordType === "report").length,
      total: timelineRecords.length,
    }),
    [vaccines, growthEntries, milestones, medicalRecords, timelineRecords],
  );

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "vaccine", label: "Vaccines", count: stats.vaccines },
    { key: "growth", label: "Growth", count: stats.growth },
    { key: "milestone", label: "Milestones", count: stats.milestones },
    { key: "visit", label: "Visits", count: stats.visits },
    { key: "report", label: "Reports", count: stats.reports },
  ];

  // Group records by month for timeline
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, TimelineRecord[]> = {};
    filteredRecords.forEach((record) => {
      const key = format(record.date, "MMMM yyyy");
      if (!groups[key]) groups[key] = [];
      groups[key].push(record);
    });
    return groups;
  }, [filteredRecords]);

  const babyAgeMonths = baby
    ? differenceInMonths(new Date(), new Date(baby.dob as string))
    : 0;

  if (!baby) {
    return (
      <div className="app-container min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500" data-testid="text-baby-not-found">
          Baby not found
        </p>
      </div>
    );
  }

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col relative">
      {/* Rich Gradient Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href={`/babycare/home/${babyProfileId}`}
            data-testid="link-back"
          >
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
            <h1
              className="text-[18px] font-bold flex items-center gap-2"
              data-testid="text-title"
            >
              <Shield className="w-5 h-5" />
              Health Records
            </h1>
            <p className="text-[12px] text-white/80">
              {baby.babyName}'s complete medical history
            </p>
          </div>
          <div className="relative">
            <Button
              onClick={() => setShowAddMenu(!showAddMenu)}
              size="icon"
              className={`w-9 h-9 rounded-full transition-all ${
                showAddMenu
                  ? "bg-white/30 rotate-45"
                  : "bg-white/15 hover:bg-white/25"
              }`}
              data-testid="button-header-add"
            >
              <Plus className="w-5 h-5 text-white" />
            </Button>

            {/* Dropdown Menu - positioned right below the button */}
            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute top-11 right-0 z-50 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden min-w-[180px]"
                >
                  <button
                    onClick={() => {
                      setShowVisitDialog(true);
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50 transition-colors border-b border-zinc-100"
                    data-testid="button-add-visit"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[13px] font-medium text-zinc-800">
                      Log Doctor Visit
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setShowReportDialog(true);
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 transition-colors"
                    data-testid="button-add-report"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[13px] font-medium text-zinc-800">
                      Upload Report
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-[20px] font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-white/80 font-medium">
              Total Records
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-[20px] font-bold text-white">{stats.vaccines}</p>
            <p className="text-[10px] text-white/80 font-medium">Vaccines</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-[20px] font-bold text-white">{stats.visits}</p>
            <p className="text-[10px] text-white/80 font-medium">Visits</p>
          </div>
        </div>

        {/* Quick Upload CTA */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-white">
                Keep records organized
              </p>
              <p className="text-[11px] text-white/70">
                Upload reports, prescriptions & documents
              </p>
            </div>
            <Button
              onClick={() => setShowReportDialog(true)}
              size="sm"
              className="bg-white text-violet-700 hover:bg-white/90 rounded-xl font-semibold shadow-lg"
              data-testid="button-quick-upload"
            >
              <FilePlus className="w-4 h-4 mr-1" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Chips with Counts */}
      <div className="bg-white border-b border-zinc-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            const typeInfo =
              filter.key !== "all" ? recordTypeInfo[filter.key] : null;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
                data-testid={`filter-${filter.key}`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20" : "bg-zinc-200"
                    }`}
                  >
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
          <div
            className="flex flex-col items-center justify-center py-12 px-6"
            data-testid="empty-state"
          >
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                activeFilter !== "all"
                  ? recordTypeInfo[activeFilter].iconBg
                  : "bg-gradient-to-br from-violet-400 to-purple-500"
              }`}
            >
              {activeFilter === "visit" ? (
                <Stethoscope className="w-10 h-10 text-white" />
              ) : activeFilter === "report" ? (
                <FileText className="w-10 h-10 text-white" />
              ) : activeFilter === "vaccine" ? (
                <Syringe className="w-10 h-10 text-white" />
              ) : activeFilter === "growth" ? (
                <TrendingUp className="w-10 h-10 text-white" />
              ) : activeFilter === "milestone" ? (
                <Star className="w-10 h-10 text-white" />
              ) : (
                <ClipboardList className="w-10 h-10 text-white" />
              )}
            </div>
            <p
              className="text-[16px] text-zinc-900 text-center font-bold mb-2"
              data-testid="text-empty-title"
            >
              {activeFilter === "visit"
                ? "No visits logged yet"
                : activeFilter === "report"
                  ? "No reports uploaded"
                  : activeFilter === "vaccine"
                    ? "No vaccines recorded"
                    : activeFilter === "growth"
                      ? "No growth data yet"
                      : activeFilter === "milestone"
                        ? "No milestones yet"
                        : "Start building your health timeline"}
            </p>
            <p
              className="text-[13px] text-zinc-500 text-center max-w-[280px] mb-6"
              data-testid="text-empty-description"
            >
              {activeFilter === "visit"
                ? "Log doctor visits, pediatric check-ups, and consultations to keep track of your baby's healthcare journey."
                : activeFilter === "report"
                  ? "Upload medical reports, prescriptions, lab results, and important documents for easy access anytime."
                  : activeFilter === "vaccine"
                    ? "Vaccines will appear here once you mark them as completed in the Vaccines section."
                    : activeFilter === "growth"
                      ? "Growth measurements will appear here when you log weight, height, or head circumference."
                      : activeFilter === "milestone"
                        ? "Celebrated milestones will be added to your timeline automatically."
                        : "All your baby's vaccines, growth data, milestones, visits, and reports will appear here in a beautiful timeline."}
            </p>
            {(activeFilter === "all" ||
              activeFilter === "visit" ||
              activeFilter === "report") && (
              <div className="flex gap-2">
                {(activeFilter === "all" || activeFilter === "visit") && (
                  <Button
                    onClick={() => setShowVisitDialog(true)}
                    className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2"
                    data-testid="button-empty-add-visit"
                  >
                    <Stethoscope className="w-4 h-4" />
                    Log Visit
                  </Button>
                )}
                {(activeFilter === "all" || activeFilter === "report") && (
                  <Button
                    onClick={() => setShowReportDialog(true)}
                    variant="outline"
                    className="rounded-xl gap-2 border-violet-200 text-violet-700"
                    data-testid="button-empty-add-report"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Report
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByMonth).map(
              ([monthYear, records], groupIndex) => (
                <div key={monthYear}>
                  {/* Month Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p
                        className="text-[14px] font-bold text-zinc-900"
                        data-testid={`month-header-${groupIndex}`}
                      >
                        {monthYear}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {records.length} record{records.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Timeline with Line */}
                  <div className="relative pl-5 border-l-2 border-violet-200 ml-5 space-y-3">
                    <AnimatePresence>
                      {records.map((record, index) => {
                        const typeInfo = recordTypeInfo[record.type];
                        const Icon = typeInfo.icon;

                        return (
                          <motion.div
                            key={record.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative"
                          >
                            {/* Timeline Dot */}
                            <div
                              className={`absolute -left-[25px] w-4 h-4 rounded-full ${typeInfo.iconBg} border-2 border-white shadow-sm`}
                            />

                            <Card
                              className={`bg-white border ${typeInfo.border} rounded-2xl overflow-hidden hover:shadow-md transition-shadow`}
                              data-testid={`record-${record.id}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-11 h-11 ${typeInfo.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}
                                  >
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <h3
                                        className="text-[14px] font-bold text-zinc-900 leading-tight"
                                        data-testid={`record-title-${record.id}`}
                                      >
                                        {record.title}
                                      </h3>
                                      <Badge
                                        className={`${typeInfo.bg} ${typeInfo.textColor} text-[10px] px-2 flex-shrink-0 hover:${typeInfo.bg}`}
                                      >
                                        {typeInfo.label.slice(0, -1)}
                                      </Badge>
                                    </div>
                                    <p
                                      className="text-[12px] text-zinc-500 mb-2"
                                      data-testid={`record-detail-${record.id}`}
                                    >
                                      {record.detail}
                                    </p>

                                    {/* Date and Additional Info */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {format(record.date, "MMM d, yyyy")}
                                      </span>
                                      {record.additionalInfo && (
                                        <span className="text-[11px] text-zinc-400">
                                          {record.additionalInfo}
                                        </span>
                                      )}
                                      {record.attachments &&
                                        record.attachments.length > 0 && (
                                          <span className="text-[11px] text-violet-600 flex items-center gap-1 font-medium">
                                            <Paperclip className="w-3 h-3" />
                                            {record.attachments.length}{" "}
                                            {record.attachments.length === 1
                                              ? "file"
                                              : "files"}
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                </div>

                                {/* View Attachment Buttons */}
                                {record.attachments &&
                                  record.attachments.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-zinc-100 space-y-2">
                                      {record.attachments.map(
                                        (attachment, idx) => {
                                          const displayName =
                                            attachment.fileName
                                              ? attachment.fileName.length > 20
                                                ? `${attachment.fileName.substring(0, 20)}...`
                                                : attachment.fileName
                                              : `File ${idx + 1}`;
                                          return (
                                            <Button
                                              key={idx}
                                              variant="outline"
                                              size="sm"
                                              className="w-full rounded-xl text-[12px] gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
                                              onClick={() =>
                                                window.open(
                                                  attachment.url,
                                                  "_blank",
                                                )
                                              }
                                              data-testid={`button-view-attachment-${record.id}-${idx}`}
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                              {displayName}
                                            </Button>
                                          );
                                        },
                                      )}
                                    </div>
                                  )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {/* Mira Card - Medical Questions */}
        <Card
          className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl mt-6 overflow-hidden"
          data-testid="card-mira-medical"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-rose-900 mb-0.5">
                  Health questions?
                </p>
                <p className="text-[11px] text-rose-600">
                  Ask AaI about your baby's medical care
                </p>
              </div>
            </div>

            {/* Sample Questions */}
            <div className="space-y-2 mb-4">
              <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wide">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] bg-white text-rose-700 px-3 py-1.5 rounded-full border border-rose-200">
                  When is the next vaccine due?
                </span>
                <span className="text-[11px] bg-white text-rose-700 px-3 py-1.5 rounded-full border border-rose-200">
                  What vaccines are required for daycare?
                </span>
                <span className="text-[11px] bg-white text-rose-700 px-3 py-1.5 rounded-full border border-rose-200">
                  How often should I visit the pediatrician?
                </span>
                <span className="text-[11px] bg-white text-rose-700 px-3 py-1.5 rounded-full border border-rose-200">
                  What documents do I need for travel?
                </span>
              </div>
            </div>

            <Link href={`/babycare/mira/${babyProfileId}`}>
              <Button
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 text-white rounded-xl shadow-md h-11 font-semibold gap-2"
                data-testid="button-ask-mira-medical"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with AaI
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Click outside to close menu */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAddMenu(false)}
        />
      )}

      {/* Add Visit Dialog - Enhanced */}
      <Dialog open={showVisitDialog} onOpenChange={setShowVisitDialog}>
        <DialogContent
          className="max-w-[360px] rounded-2xl"
          data-testid="dialog-add-visit"
        >
          <DialogHeader>
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-center">
              Log Doctor Visit
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-500 text-center">
              Record details of a pediatric visit or consultation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="visitDate" className="text-[13px] font-semibold">
                Visit Date
              </Label>
              <Input
                id="visitDate"
                type="date"
                value={visitForm.recordDate}
                onChange={(e) =>
                  setVisitForm({ ...visitForm, recordDate: e.target.value })
                }
                className="mt-1.5 rounded-xl h-11"
                data-testid="input-visit-date"
              />
            </div>
            <div>
              <Label htmlFor="title" className="text-[13px] font-semibold">
                Title / Reason for Visit *
              </Label>
              <Input
                id="title"
                placeholder="e.g., Regular checkup, Fever, Vaccination"
                value={visitForm.title}
                onChange={(e) =>
                  setVisitForm({ ...visitForm, title: e.target.value })
                }
                className="mt-1.5 rounded-xl h-11"
                data-testid="input-visit-title"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="doctorName"
                  className="text-[13px] font-semibold"
                >
                  Doctor Name
                </Label>
                <Input
                  id="doctorName"
                  placeholder="Dr. Sharma"
                  value={visitForm.doctorName}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, doctorName: e.target.value })
                  }
                  className="mt-1.5 rounded-xl h-11"
                  data-testid="input-doctor-name"
                />
              </div>
              <div>
                <Label
                  htmlFor="hospitalName"
                  className="text-[13px] font-semibold"
                >
                  Hospital/Clinic
                </Label>
                <Input
                  id="hospitalName"
                  placeholder="Apollo"
                  value={visitForm.hospitalName}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, hospitalName: e.target.value })
                  }
                  className="mt-1.5 rounded-xl h-11"
                  data-testid="input-hospital-name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="diagnosis" className="text-[13px] font-semibold">
                Diagnosis (optional)
              </Label>
              <Input
                id="diagnosis"
                placeholder="e.g., Routine checkup, Common cold"
                value={visitForm.diagnosis}
                onChange={(e) =>
                  setVisitForm({ ...visitForm, diagnosis: e.target.value })
                }
                className="mt-1.5 rounded-xl h-11"
                data-testid="input-diagnosis"
              />
            </div>
            <div>
              <Label
                htmlFor="description"
                className="text-[13px] font-semibold"
              >
                Notes (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Diagnosis, prescriptions, follow-up..."
                value={visitForm.description}
                onChange={(e) =>
                  setVisitForm({ ...visitForm, description: e.target.value })
                }
                className="mt-1.5 rounded-xl resize-none"
                rows={2}
                data-testid="input-visit-notes"
              />
            </div>
            <div>
              <Label htmlFor="visitFiles" className="text-[13px] font-semibold">
                Attach Files (optional)
              </Label>
              <Input
                id="visitFiles"
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setVisitForm({ ...visitForm, files });
                }}
                className="mt-1.5 rounded-xl h-11"
                data-testid="input-visit-files"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowVisitDialog(false)}
              className="flex-1 rounded-xl h-11"
              data-testid="button-cancel-visit"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createVisit.mutate(visitForm)}
              disabled={!visitForm.title || createVisit.isPending}
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 rounded-xl h-11 font-semibold shadow-lg"
              data-testid="button-save-visit"
            >
              {createVisit.isPending ? "Saving..." : "Save Visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Report Dialog - Enhanced with File Upload */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent
          className="max-w-[360px] rounded-2xl"
          data-testid="dialog-add-report"
        >
          <DialogHeader>
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-center">
              Upload Medical Report
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-500 text-center">
              Store prescriptions, lab results, scans & documents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="reportDate" className="text-[13px] font-semibold">
                Report Date
              </Label>
              <Input
                id="reportDate"
                type="date"
                value={reportForm.recordDate}
                onChange={(e) =>
                  setReportForm({ ...reportForm, recordDate: e.target.value })
                }
                className="mt-1.5 rounded-xl h-11"
                data-testid="input-report-date"
              />
            </div>
            <div>
              <Label
                htmlFor="reportTitle"
                className="text-[13px] font-semibold"
              >
                Title *
              </Label>
              <Input
                id="reportTitle"
                placeholder="e.g., Blood Test Results, Prescription"
                value={reportForm.title}
                onChange={(e) =>
                  setReportForm({ ...reportForm, title: e.target.value })
                }
                className="mt-1.5 rounded-xl h-11"
                data-testid="input-report-title"
              />
            </div>
            <div>
              <Label
                htmlFor="reportCategory"
                className="text-[13px] font-semibold"
              >
                Document Type
              </Label>
              <Select
                value={reportForm.category}
                onValueChange={(value) =>
                  setReportForm({ ...reportForm, category: value })
                }
              >
                <SelectTrigger
                  className="mt-1.5 rounded-xl h-11"
                  data-testid="select-report-category"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prescription">
                    <span className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-green-600" />
                      Prescription
                    </span>
                  </SelectItem>
                  <SelectItem value="lab_result">
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      Lab Result
                    </span>
                  </SelectItem>
                  <SelectItem value="scan">
                    <span className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-purple-600" />
                      Scan / X-Ray
                    </span>
                  </SelectItem>
                  <SelectItem value="vaccination_record">
                    <span className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-cyan-600" />
                      Vaccination Record
                    </span>
                  </SelectItem>
                  <SelectItem value="discharge_summary">
                    <span className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-amber-600" />
                      Discharge Summary
                    </span>
                  </SelectItem>
                  <SelectItem value="birth_certificate">
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-600" />
                      Birth Certificate
                    </span>
                  </SelectItem>
                  <SelectItem value="document">
                    <span className="flex items-center gap-2">
                      <File className="w-4 h-4 text-zinc-600" />
                      Other Document
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="doctorName"
                  className="text-[13px] font-semibold"
                >
                  Doctor Name
                </Label>
                <Input
                  id="doctorName"
                  placeholder="Dr. Sharma"
                  value={reportForm.doctorName}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, doctorName: e.target.value })
                  }
                  className="mt-1.5 rounded-xl h-11"
                  data-testid="input-doctor-name"
                />
              </div>
              <div>
                <Label
                  htmlFor="hospitalName"
                  className="text-[13px] font-semibold"
                >
                  Hospital/Clinic
                </Label>
                <Input
                  id="hospitalName"
                  placeholder="Apollo"
                  value={reportForm.hospitalName}
                  onChange={(e) =>
                    setReportForm({
                      ...reportForm,
                      hospitalName: e.target.value,
                    })
                  }
                  className="mt-1.5 rounded-xl h-11"
                  data-testid="input-hospital-name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="diagnosis" className="text-[13px] font-semibold">
                Diagnosis (optional)
              </Label>
              <Input
                id="diagnosis"
                placeholder="e.g., Routine checkup"
                value={reportForm.diagnosis}
                onChange={(e) =>
                  setReportForm({ ...reportForm, diagnosis: e.target.value })
                }
                className="mt-1.5 rounded-xl h-11"
                data-testid="input-diagnosis"
              />
            </div>
            <div>
              <Label
                htmlFor="reportDescription"
                className="text-[13px] font-semibold"
              >
                Description (optional)
              </Label>
              <Textarea
                id="reportDescription"
                placeholder="Brief description of the report..."
                value={reportForm.description}
                onChange={(e) =>
                  setReportForm({ ...reportForm, description: e.target.value })
                }
                className="mt-1.5 rounded-xl resize-none"
                rows={2}
                data-testid="input-report-description"
              />
            </div>
            <div>
              <Label
                htmlFor="reportFiles"
                className="text-[13px] font-semibold"
              >
                Attach Files *
              </Label>
              <Input
                id="reportFiles"
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setReportForm({ ...reportForm, files });
                }}
                className="mt-1.5 rounded-xl h-11"
                data-testid="input-report-files"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Upload documents, photos, PDFs, etc.
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
              className="flex-1 rounded-xl h-11"
              data-testid="button-cancel-report"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createReport.mutate(reportForm)}
              disabled={
                !reportForm.title ||
                reportForm.files.length === 0 ||
                createReport.isPending
              }
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 rounded-xl h-11 font-semibold shadow-lg"
              data-testid="button-save-report"
            >
              {createReport.isPending ? "Saving..." : "Save Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Mira Button */}
      <MiraFab babyId={babyProfileId} />
    </div>
  );
}
