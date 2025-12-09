import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { 
  ArrowLeft, 
  Phone, 
  AlertTriangle, 
  UserX, 
  RefreshCw,
  Check,
  X,
  Clock,
  Calendar,
  FileText,
  ChevronRight,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MiraFab } from "@/components/MiraFab";

interface NannyBooking {
  nannyName: string;
  nannyInitials: string;
  shiftType: string;
  shiftHours: string;
  startTime: string;
  endTime: string;
  isOnDuty: boolean;
  bookingId: string;
}

interface AttendanceDay {
  date: string;
  day: string;
  status: "present" | "absent" | "pending";
}

interface NoteEntry {
  time: string;
  type: "feed" | "nap" | "activity";
  content: string;
}

const mockAttendance: AttendanceDay[] = [
  { date: "Dec 9", day: "Mon", status: "present" },
  { date: "Dec 8", day: "Sun", status: "present" },
  { date: "Dec 7", day: "Sat", status: "absent" },
  { date: "Dec 6", day: "Fri", status: "present" },
  { date: "Dec 5", day: "Thu", status: "present" },
];

const mockNotes: NoteEntry[] = [
  { time: "10:30 AM", type: "feed", content: "Fed 120ml formula" },
  { time: "11:45 AM", type: "nap", content: "Napped for 45 minutes" },
  { time: "01:15 PM", type: "feed", content: "Fed mashed banana" },
  { time: "02:30 PM", type: "activity", content: "Played with blocks" },
];

export default function NannyDashboardPage() {
  const { babyId } = useParams<{ babyId: string }>();
  const [, navigate] = useLocation();
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [helpAction, setHelpAction] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [booking, setBooking] = useState<NannyBooking | null>(null);

  useEffect(() => {
    const storedBooking = localStorage.getItem(`nanny_booking_${babyId}`);
    if (storedBooking) {
      setBooking(JSON.parse(storedBooking));
    }
  }, [babyId]);

  const handleHelpOption = (action: string) => {
    setHelpAction(action);
    setShowConfirmation(true);
  };

  const handleConfirmAction = () => {
    setShowConfirmation(false);
    setShowHelpDialog(false);
    setHelpAction(null);
  };

  const getHelpTitle = () => {
    switch (helpAction) {
      case "not-arrived": return "Report: Nanny Didn't Arrive";
      case "safety": return "Report Safety Concern";
      case "replacement": return "Request Replacement";
      default: return "Help";
    }
  };

  const getHelpMessage = () => {
    switch (helpAction) {
      case "not-arrived": 
        return "We'll contact the nanny and arrange a replacement if needed. You'll receive a callback within 15 minutes.";
      case "safety": 
        return "Your safety is our priority. Our team will call you immediately to understand the situation and take necessary action.";
      case "replacement": 
        return "We'll find a replacement nanny for you. This may take 2-4 hours depending on availability.";
      default: 
        return "";
    }
  };

  if (!booking) {
    return (
      <div className="app-container min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-[14px] text-zinc-500 mb-4">No active nanny booking found</p>
          <Button onClick={() => navigate(`/babycare/nanny/${babyId}`)} data-testid="button-find-nanny">
            Find a Nanny
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen bg-zinc-50 flex flex-col">
      <div className="bg-white border-b border-zinc-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/babycare/home/${babyId}`}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full" 
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-600" />
            </Button>
          </Link>
          <h1 className="text-[16px] font-semibold text-zinc-900">Nanny Today</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="bg-white border-b border-zinc-100 px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{booking.nannyInitials}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-[17px] font-semibold text-zinc-900">{booking.nannyName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  booking.isOnDuty 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-zinc-100 text-zinc-500"
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    booking.isOnDuty ? "bg-emerald-500" : "bg-zinc-400"
                  }`} />
                  {booking.isOnDuty ? "On Duty" : "Off Duty"}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-violet-50"
              onClick={() => window.open("tel:+919876543210")}
              data-testid="button-call-nanny"
            >
              <Phone className="w-5 h-5 text-violet-600" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="border-zinc-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-violet-500" />
                <h3 className="text-[14px] font-semibold text-zinc-800">Today's Shift</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-zinc-50 rounded-xl p-3">
                  <p className="text-[11px] text-zinc-500 mb-1">Start Time</p>
                  <p className="text-[14px] font-medium text-zinc-800">{booking.startTime}</p>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3">
                  <p className="text-[11px] text-zinc-500 mb-1">End Time</p>
                  <p className="text-[14px] font-medium text-zinc-800">{booking.endTime}</p>
                </div>
              </div>

              <div className="bg-violet-50 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-zinc-600">Shift Type</span>
                  <span className="text-[13px] font-medium text-violet-700">{booking.shiftType} ({booking.shiftHours})</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-[13px] text-zinc-600">Check-in</span>
                  </div>
                  <span className="text-[13px] font-medium text-emerald-600">
                    09:12 AM
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <span className="text-[13px] text-zinc-600">Check-out</span>
                  </div>
                  <span className="text-[13px] font-medium text-zinc-400">
                    Pending
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-violet-500" />
                <h3 className="text-[14px] font-semibold text-zinc-800">Attendance History</h3>
              </div>
              
              <div className="space-y-2">
                {mockAttendance.map((day, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-zinc-500 w-12">{day.day}</span>
                      <span className="text-[13px] text-zinc-700">{day.date}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium ${
                      day.status === "present" 
                        ? "bg-emerald-50 text-emerald-600"
                        : day.status === "absent"
                        ? "bg-red-50 text-red-600"
                        : "bg-zinc-50 text-zinc-500"
                    }`}>
                      {day.status === "present" && <Check className="w-3 h-3" />}
                      {day.status === "absent" && <X className="w-3 h-3" />}
                      {day.status === "pending" && <Clock className="w-3 h-3" />}
                      {day.status.charAt(0).toUpperCase() + day.status.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-violet-500" />
                <h3 className="text-[14px] font-semibold text-zinc-800">Today's Notes</h3>
              </div>
              
              <div className="space-y-3">
                {mockNotes.map((note, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 py-2 border-b border-zinc-50 last:border-0"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      note.type === "feed" 
                        ? "bg-amber-100"
                        : note.type === "nap"
                        ? "bg-blue-100"
                        : "bg-pink-100"
                    }`}>
                      <span className="text-[12px]">
                        {note.type === "feed" ? "🍼" : note.type === "nap" ? "😴" : "🎮"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-zinc-700">{note.content}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{note.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <Button
            onClick={() => setShowHelpDialog(true)}
            variant="outline"
            className="w-full h-12 rounded-xl text-[14px] font-medium gap-2 border-red-200 text-red-600 hover:bg-red-50"
            data-testid="button-need-help"
          >
            <Shield className="w-4 h-4" />
            Need Help?
          </Button>
        </div>
      </div>

      <Dialog open={showHelpDialog && !showConfirmation} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold text-zinc-900">
              How can we help?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <button
              onClick={() => handleHelpOption("not-arrived")}
              className="w-full p-4 rounded-xl border border-zinc-200 flex items-center gap-3 hover:bg-zinc-50 transition-colors"
              data-testid="help-not-arrived"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <UserX className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-medium text-zinc-800">Nanny didn't arrive</p>
                <p className="text-[12px] text-zinc-500">Report a no-show</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            <button
              onClick={() => handleHelpOption("safety")}
              className="w-full p-4 rounded-xl border border-zinc-200 flex items-center gap-3 hover:bg-zinc-50 transition-colors"
              data-testid="help-safety"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-medium text-zinc-800">Safety concern</p>
                <p className="text-[12px] text-zinc-500">Report an urgent issue</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            <button
              onClick={() => handleHelpOption("replacement")}
              className="w-full p-4 rounded-xl border border-zinc-200 flex items-center gap-3 hover:bg-zinc-50 transition-colors"
              data-testid="help-replacement"
            >
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-medium text-zinc-800">Need replacement</p>
                <p className="text-[12px] text-zinc-500">Request a different nanny</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100">
            <button
              onClick={() => window.open("tel:+919876543210")}
              className="w-full flex items-center justify-center gap-2 text-[13px] text-violet-600 font-medium"
              data-testid="button-call-support"
            >
              <Phone className="w-4 h-4" />
              Call Support: +91 98765 43210
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold text-zinc-900">
              {getHelpTitle()}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-[13px] text-zinc-600 leading-relaxed">
              {getHelpMessage()}
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirmation(false)}
              data-testid="button-cancel-help"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-pink-500 to-violet-600 text-white"
              onClick={handleConfirmAction}
              data-testid="button-confirm-help"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MiraFab babyId={babyId} />
    </div>
  );
}
