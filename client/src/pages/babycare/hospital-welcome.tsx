import { Link, useLocation } from "wouter";
import { Baby, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BabyCareHospitalWelcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="app-container min-h-screen bg-white flex flex-col">
      {/* Dark Charcoal Header */}
      <div className="bg-[#1a1a1a] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 -ml-2"
              data-testid="button-back-home"
            >
              Back to Explore
            </Button>
          </Link>
          <span className="text-[13px] text-white/60 font-medium">
            Hospital Onboarding
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 bg-white">
        {/* Hospital Icon */}
        <div className="relative mb-8" data-testid="icon-hospital">
          <div className="w-28 h-28 bg-violet-600 rounded-full flex items-center justify-center shadow-xl">
            <Building2 className="w-14 h-14 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
            <Baby className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Welcome Text */}
        <h1
          className="text-[26px] font-bold text-zinc-900 text-center mb-3 leading-tight"
          data-testid="text-hospital-title"
        >
          Welcome to BabyCare
        </h1>
        <div className="flex items-center gap-2 bg-violet-100 rounded-full px-4 py-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-violet-600" />
          <p
            className="text-[13px] text-violet-700 font-medium"
            data-testid="text-hospital-badge"
          >
            Recommended by Apollo Hospital
          </p>
        </div>
        <p
          className="text-[15px] text-zinc-500 text-center max-w-[300px] leading-relaxed mb-8"
          data-testid="text-hospital-subtitle"
        >
          Your baby's health records have been prepared by the hospital. Let's
          complete the setup together.
        </p>

        {/* Pre-filled Info Card */}
        <Card
          className="w-full max-w-xs bg-white border border-violet-100 shadow-md rounded-2xl mb-8"
          data-testid="card-hospital-info"
        >
          <CardContent className="p-5">
            <p className="text-[12px] text-zinc-500 mb-3 font-medium">
              Your baby's details
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-zinc-500">Birth Date</span>
                <span
                  className="text-[14px] font-semibold text-zinc-900"
                  data-testid="text-birth-date"
                >
                  Dec 15, 2024
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-zinc-500">Hospital</span>
                <span
                  className="text-[14px] font-semibold text-zinc-900"
                  data-testid="text-hospital-name"
                >
                  Apollo Hospital
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-zinc-500">
                  Vaccines Given
                </span>
                <span
                  className="text-[14px] font-semibold text-zinc-900"
                  data-testid="text-vaccines-given"
                >
                  BCG, Hep B
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center gap-2" data-testid="benefit-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-[13px] text-zinc-600">
              Birth vaccines pre-recorded
            </span>
          </div>
          <div className="flex items-center gap-2" data-testid="benefit-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-[13px] text-zinc-600">
              Personalized vaccine schedule
            </span>
          </div>
          <div className="flex items-center gap-2" data-testid="benefit-3">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-[13px] text-zinc-600">
              Growth tracking from day 1
            </span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-8 bg-white">
        <Button
          onClick={() => setLocation("/babycare/setup?hospital=apollo")}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-2xl h-14 text-[16px] font-semibold shadow-lg shadow-violet-200/50 gap-2"
          data-testid="button-continue-setup"
        >
          Continue Setup
          <ArrowRight className="w-5 h-5" />
        </Button>
        <Link href="/babycare">
          <p
            className="text-[13px] text-violet-600 text-center mt-4 font-medium cursor-pointer"
            data-testid="link-start-fresh"
          >
            Start fresh instead
          </p>
        </Link>
      </div>
    </div>
  );
}
