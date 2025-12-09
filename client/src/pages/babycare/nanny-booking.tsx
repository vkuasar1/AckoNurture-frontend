import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Calendar,
  CreditCard,
  Phone,
  CheckCircle2,
  MapPinned,
  FileText,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { MiraFab } from "@/components/MiraFab";

type BookingStep = 1 | 2 | 3 | 4;

interface BookingData {
  shiftType: "half-day" | "full-day" | "night";
  duration: string;
  startDate: string;
  address: string;
  liveLocation: boolean;
  dailySummary: boolean;
}

const SHIFT_TYPES = [
  { id: "half-day", label: "Half Day", hours: "4 hours", dailyRate: 600, monthlyRate: 15000 },
  { id: "full-day", label: "Full Day", hours: "8 hours", dailyRate: 1000, monthlyRate: 25000 },
  { id: "night", label: "Night Shift", hours: "10 hours", dailyRate: 1200, monthlyRate: 30000 },
];

const ADDRESSES = [
  { id: "home", label: "Home", address: "42, Green Park Extension, New Delhi" },
  { id: "office", label: "Office", address: "WeWork, Cyber City, Gurgaon" },
];

const mockNannyNames: Record<string, string> = {
  "1": "Priya S.",
  "2": "Lakshmi D.",
  "3": "Meera K.",
  "4": "Anita R.",
};

export default function NannyBookingPage() {
  const { babyId, nannyId } = useParams<{ babyId: string; nannyId: string }>();
  const [, navigate] = useLocation();
  
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDate = urlParams.get("date") || "Dec 10";
  
  const [step, setStep] = useState<BookingStep>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  const [data, setData] = useState<BookingData>({
    shiftType: "half-day",
    duration: "1 day",
    startDate: selectedDate,
    address: ADDRESSES[0].address,
    liveLocation: true,
    dailySummary: true,
  });

  const nannyName = mockNannyNames[nannyId || "1"] || "Priya S.";
  const selectedShift = SHIFT_TYPES.find(s => s.id === data.shiftType) || SHIFT_TYPES[0];

  const handleBack = () => {
    if (step === 1) {
      navigate(`/babycare/nanny-profile/${babyId}/${nannyId}`);
    } else {
      setStep((step - 1) as BookingStep);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as BookingStep);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const id = `NB${Date.now().toString().slice(-6)}`;
    setBookingId(id);
    
    const bookingData = {
      nannyName,
      nannyInitials: nannyName.split(" ").map(n => n[0]).join(""),
      shiftType: selectedShift.label,
      shiftHours: selectedShift.hours,
      startTime: "09:00 AM",
      endTime: selectedShift.id === "half-day" ? "01:00 PM" : selectedShift.id === "full-day" ? "05:00 PM" : "07:00 AM",
      isOnDuty: true,
      bookingId: id,
    };
    localStorage.setItem(`nanny_booking_${babyId}`, JSON.stringify(bookingData));
    
    setIsProcessing(false);
    setStep(4);
  };

  const handleDone = () => {
    navigate(`/babycare/nanny/${babyId}`);
  };

  return (
    <div className="app-container min-h-screen bg-zinc-50 flex flex-col">
      <div className="bg-white border-b border-zinc-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={handleBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </Button>
          <h1 className="text-[16px] font-semibold text-zinc-900">
            {step === 4 ? "Booking Confirmed" : "Book Nanny"}
          </h1>
        </div>
        
        {step < 4 && (
          <div className="flex items-center gap-2 mt-3 px-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div 
                  className={`w-full h-1.5 rounded-full transition-all ${
                    s < step ? "bg-violet-600" : s === step ? "bg-violet-600" : "bg-zinc-200"
                  }`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <div className="mb-5">
                <h2 className="text-[18px] font-bold text-zinc-900">Confirm details</h2>
                <p className="text-[13px] text-zinc-500 mt-1">Review your booking information</p>
              </div>

              <Card className="border-zinc-200 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-100">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {nannyName.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-zinc-900">{nannyName}</h3>
                      <p className="text-[12px] text-zinc-500">Verified nanny</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-zinc-500">Start Date</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-violet-500" />
                        <span className="text-[13px] font-medium text-zinc-800">{data.startDate}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mb-4">
                <h3 className="text-[14px] font-semibold text-zinc-800 mb-3">Select shift type</h3>
                <div className="space-y-2">
                  {SHIFT_TYPES.map((shift) => (
                    <button
                      key={shift.id}
                      onClick={() => setData(prev => ({ ...prev, shiftType: shift.id as BookingData["shiftType"] }))}
                      className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                        data.shiftType === shift.id
                          ? "border-violet-500 bg-violet-50"
                          : "border-zinc-200 bg-white"
                      }`}
                      data-testid={`shift-${shift.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-violet-500" />
                        <div className="text-left">
                          <span className="text-[14px] font-medium text-zinc-800 block">{shift.label}</span>
                          <span className="text-[12px] text-zinc-500">{shift.hours}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] font-semibold text-violet-600">₹{shift.dailyRate}</span>
                        {data.shiftType === shift.id && (
                          <Check className="w-5 h-5 text-violet-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-[14px] font-semibold text-zinc-800 mb-3">Location</h3>
                <div className="space-y-2">
                  {ADDRESSES.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setData(prev => ({ ...prev, address: addr.address }))}
                      className={`w-full p-4 rounded-xl border-2 flex items-start gap-3 transition-all ${
                        data.address === addr.address
                          ? "border-violet-500 bg-violet-50"
                          : "border-zinc-200 bg-white"
                      }`}
                      data-testid={`address-${addr.id}`}
                    >
                      <MapPin className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                      <div className="text-left flex-1">
                        <span className="text-[14px] font-medium text-zinc-800 block">{addr.label}</span>
                        <span className="text-[12px] text-zinc-500">{addr.address}</span>
                      </div>
                      {data.address === addr.address && (
                        <Check className="w-5 h-5 text-violet-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <div className="mb-5">
                <h2 className="text-[18px] font-bold text-zinc-900">Add-ons</h2>
                <p className="text-[13px] text-zinc-500 mt-1">Optional features for peace of mind</p>
              </div>

              <div className="space-y-3">
                <Card 
                  className={`border-2 transition-all cursor-pointer ${
                    data.liveLocation ? "border-violet-500 bg-violet-50" : "border-zinc-200"
                  }`}
                  onClick={() => setData(prev => ({ ...prev, liveLocation: !prev.liveLocation }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                        <MapPinned className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[14px] font-semibold text-zinc-900">Live location sharing</h3>
                          <Checkbox 
                            checked={data.liveLocation}
                            data-testid="checkbox-live-location"
                          />
                        </div>
                        <p className="text-[12px] text-zinc-500 mt-1">
                          Track nanny's location during the shift for added safety
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`border-2 transition-all cursor-pointer ${
                    data.dailySummary ? "border-violet-500 bg-violet-50" : "border-zinc-200"
                  }`}
                  onClick={() => setData(prev => ({ ...prev, dailySummary: !prev.dailySummary }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[14px] font-semibold text-zinc-900">Daily summary in app</h3>
                          <Checkbox 
                            checked={data.dailySummary}
                            data-testid="checkbox-daily-summary"
                          />
                        </div>
                        <p className="text-[12px] text-zinc-500 mt-1">
                          Get updates on feeding, naps, and activities
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
                <p className="text-[12px] text-violet-700 text-center">
                  These add-ons are included at no extra cost
                </p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <div className="mb-5">
                <h2 className="text-[18px] font-bold text-zinc-900">Price & Payment</h2>
                <p className="text-[13px] text-zinc-500 mt-1">Secure payment powered by Acko</p>
              </div>

              <Card className="border-zinc-200 mb-4">
                <CardContent className="p-4">
                  <h3 className="text-[14px] font-semibold text-zinc-800 mb-3">Booking Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-zinc-600">Nanny</span>
                      <span className="text-[13px] font-medium text-zinc-900">{nannyName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-zinc-600">Shift</span>
                      <span className="text-[13px] font-medium text-zinc-900">{selectedShift.label} ({selectedShift.hours})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-zinc-600">Date</span>
                      <span className="text-[13px] font-medium text-zinc-900">{data.startDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-zinc-600">Location</span>
                      <span className="text-[13px] font-medium text-zinc-900 text-right max-w-[180px] truncate">{data.address.split(",")[0]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 mb-4">
                <CardContent className="p-4">
                  <h3 className="text-[14px] font-semibold text-zinc-800 mb-3">Price Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-zinc-600">{selectedShift.label} rate</span>
                      <span className="text-[13px] text-zinc-800">₹{selectedShift.dailyRate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-zinc-600">Platform fee</span>
                      <span className="text-[13px] text-zinc-800">₹49</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                      <span className="text-[14px] font-semibold text-zinc-900">Total</span>
                      <span className="text-[16px] font-bold text-violet-600">₹{selectedShift.dailyRate + 49}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-zinc-500" />
                    <span className="text-[13px] font-medium text-zinc-700">Payment Method</span>
                  </div>
                  <div className="p-3 bg-violet-50 border-2 border-violet-500 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[13px] font-medium text-zinc-800">UPI / Google Pay</span>
                    </div>
                    <Check className="w-5 h-5 text-violet-600" />
                  </div>
                </CardContent>
              </Card>

              <p className="text-[11px] text-zinc-500 text-center">
                You're only charged after the booking is confirmed.
              </p>
            </motion.div>
          )}

          {step === 4 && bookingId && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 flex flex-col items-center pt-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-[22px] font-bold text-zinc-900 text-center">Booking Confirmed!</h2>
              <p className="text-[14px] text-zinc-500 text-center mt-2">
                Your nanny is on the way
              </p>

              <Card className="border-violet-200 mt-6 w-full bg-gradient-to-br from-violet-50 to-pink-50">
                <CardContent className="p-4 text-center">
                  <p className="text-[12px] text-zinc-500 mb-1">Booking ID</p>
                  <p className="text-[18px] font-bold text-violet-600">{bookingId}</p>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 mt-4 w-full">
                <CardContent className="p-4">
                  <h3 className="text-[14px] font-semibold text-zinc-800 mb-4">What happens next</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-violet-600">1</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-zinc-800">{nannyName} will contact you</p>
                        <p className="text-[12px] text-zinc-500">Within 30 minutes to confirm arrival details</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-violet-600">2</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-zinc-800">Expected arrival</p>
                        <p className="text-[12px] text-zinc-500">{data.startDate} by 9:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-violet-600">3</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-zinc-800">Track in real-time</p>
                        <p className="text-[12px] text-zinc-500">You'll see live location once she starts</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 p-4 bg-amber-50 rounded-xl w-full">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-medium text-amber-800">Need help?</p>
                    <p className="text-[11px] text-amber-600 mt-0.5">
                      Contact us anytime via the app. We're here 24/7.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          {step === 1 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] text-zinc-600">{selectedShift.label} ({selectedShift.hours})</p>
                <p className="text-[16px] font-bold text-violet-600">₹{selectedShift.dailyRate}</p>
              </div>
              <Button
                onClick={handleNext}
                className="w-full h-14 rounded-2xl text-[15px] font-semibold gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white"
                data-testid="button-next"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] text-zinc-600">{selectedShift.label} ({selectedShift.hours})</p>
                <p className="text-[16px] font-bold text-violet-600">₹{selectedShift.dailyRate}</p>
              </div>
              <Button
                onClick={handleNext}
                className="w-full h-14 rounded-2xl text-[15px] font-semibold gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white"
                data-testid="button-next"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
          {step === 3 && (
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-14 rounded-2xl text-[15px] font-semibold gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white"
              data-testid="button-pay"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <>Pay ₹{selectedShift.dailyRate + 49}</>
              )}
            </Button>
          )}
          {step === 4 && (
            <Button
              onClick={handleDone}
              className="w-full h-14 rounded-2xl text-[15px] font-semibold gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white"
              data-testid="button-done"
            >
              Done
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <MiraFab babyId={babyId} />
    </div>
  );
}
