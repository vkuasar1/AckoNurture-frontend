import { Link } from "wouter";
import {
  Car,
  Bike,
  Heart,
  Plane,
  Umbrella,
  Banknote,
  Wrench,
  FileText,
  CreditCard,
  Compass,
  MessageSquare,
  ArrowRight,
  Baby,
  AlertCircle,
  Home as HomeIcon,
  Headphones,
  ShieldCheck,
  Users,
  Gift,
  ChevronRight,
  Building2,
  LayoutGrid,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ExplorePage() {
  return (
    <div className="app-container bg-zinc-100 min-h-screen flex flex-col">
      {/* Dark Header Section - Acko's deep charcoal */}
      <div className="bg-gradient-to-b from-[#1a1a1a] via-[#141414] to-[#0f0f0f] text-white px-4 pt-3 pb-5">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 bg-zinc-700 border border-zinc-600">
              <AvatarFallback className="bg-zinc-700 text-white text-sm font-medium">
                A
              </AvatarFallback>
            </Avatar>
            <span
              className="text-[15px] font-medium"
              data-testid="text-greeting"
            >
              Hey Aakash
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-zinc-800/90 hover:bg-zinc-700 text-white rounded-full px-3.5 h-9 gap-2 border-zinc-700"
            data-testid="button-emergency"
          >
            <AlertCircle className="h-4 w-4 text-red-500 fill-red-500" />
            <span className="text-[13px] font-medium">Emergency</span>
          </Button>
        </div>

        {/* Quick Access Pills */}
        <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-1">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-2 min-w-[52px] h-auto py-2 px-1 hover:bg-transparent"
            data-testid="button-quick-vehicles"
          >
            <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center">
              <Car className="h-5 w-5 text-zinc-300" />
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              Vehicles
            </span>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center gap-2 min-w-[52px] h-auto py-2 px-1 hover:bg-transparent"
            data-testid="button-quick-family"
          >
            <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center">
              <Users className="h-5 w-5 text-zinc-300" />
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              Family
            </span>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center gap-2 min-w-[52px] h-auto py-2 px-1 hover:bg-transparent"
            data-testid="button-quick-policies"
          >
            <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-zinc-300" />
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              Policies
            </span>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center gap-2 min-w-[52px] h-auto py-2 px-1 hover:bg-transparent"
            data-testid="button-quick-rewards"
          >
            <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center">
              <Gift className="h-5 w-5 text-zinc-300" />
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              Rewards
            </span>
          </Button>
        </div>

        {/* Promotional Banner */}

        <Link href="/babycare">
          <Card
            className="bg-gradient-to-br from-pink-50 via-violet-50 to-white 
             border border-pink-100 
             shadow-[0_4px_12px_rgba(255,255,255,0.8)] 
             rounded-2xl mb-4 cursor-pointer 
             hover:shadow-[0_6px_18px_rgba(255,255,255,1)] 
             transition-shadow"
            data-testid="card-featured-nurture"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-[16px] font-bold text-zinc-900 leading-tight">
                      Nurture
                    </h3>
                    <Badge className="bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:from-pink-500 hover:to-violet-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      New
                    </Badge>
                  </div>
                  <p className="text-[13px] text-zinc-600 leading-relaxed font-medium">
                    Complete care for new moms & babies
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Vaccines, growth tracking, recovery support & more
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-8 w-8"
                >
                  <ArrowRight className="w-5 h-5 text-violet-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* White Content Area */}
      <div className="flex-1 bg-white rounded-t-[28px] -mt-3 overflow-y-auto pb-24 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Buy Insurance Section */}
        <div className="px-4 pt-6 pb-4">
          <h2
            className="text-[20px] font-bold text-zinc-900 mb-4"
            data-testid="text-section-insurance"
          >
            Buy insurance
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Car - Large Card */}
            <Card className="col-span-1 row-span-2 border border-zinc-100 shadow-sm rounded-2xl relative">
              <CardContent className="p-4 h-full">
                <Badge className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm hover:bg-red-500">
                  Sale
                </Badge>
                <h3 className="text-[16px] font-bold text-zinc-900 mb-0.5">
                  Car
                </h3>
                <p className="text-[12px] text-zinc-500 mb-2">
                  Get your policy instantly
                </p>
                <Badge
                  variant="secondary"
                  className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                >
                  Zero commission
                </Badge>
                <div className="absolute bottom-4 right-3 w-24 h-16">
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 via-slate-100 to-white rounded-lg flex items-center justify-center shadow-inner">
                    <Car
                      className="w-12 h-12 text-zinc-500"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand new car */}
            <Card className="border border-zinc-100 shadow-sm rounded-2xl">
              <CardContent className="p-3.5 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-zinc-900 mb-0.5 leading-tight">
                    Brand new car?
                  </h3>
                  <p className="text-[12px] text-zinc-500">
                    Save up to {"\u20B9"}36,000
                  </p>
                </div>
                <div className="w-16 h-12 bg-gradient-to-br from-blue-100 to-cyan-50 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Car className="w-9 h-9 text-blue-500" strokeWidth={1.5} />
                </div>
              </CardContent>
            </Card>

            {/* Bike & Scooter */}
            <Card className="border border-zinc-100 shadow-sm rounded-2xl">
              <CardContent className="p-3.5 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-zinc-900 mb-0.5 leading-tight">
                    Bike & Scooter
                  </h3>
                  <p className="text-[12px] text-zinc-500">
                    Starts at just {"\u20B9"}112
                  </p>
                </div>
                <div className="w-16 h-12 bg-gradient-to-br from-violet-100 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Bike className="w-9 h-9 text-violet-600" strokeWidth={1.5} />
                </div>
              </CardContent>
            </Card>

            {/* Health */}
            <Card className="border border-zinc-100 shadow-sm rounded-2xl relative">
              <CardContent className="p-3.5">
                <h3 className="text-[14px] font-bold text-zinc-900 mb-0.5">
                  Health
                </h3>
                <p className="text-[12px] text-zinc-500 mb-1.5">
                  100% bill coverage
                </p>
                <Badge
                  variant="secondary"
                  className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                >
                  0% GST
                </Badge>
                <div className="absolute bottom-2.5 right-2.5 w-12 h-12">
                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-50 rounded-lg flex items-center justify-center shadow-inner">
                    <Building2
                      className="w-7 h-7 text-pink-500"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Travel */}
            <Card className="border border-zinc-100 shadow-sm rounded-2xl relative">
              <CardContent className="p-3.5">
                <h3 className="text-[14px] font-bold text-zinc-900 mb-0.5">
                  Travel
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                >
                  Get AirPass
                </Badge>
                <div className="absolute bottom-2.5 right-2.5 w-12 h-12">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-50 rounded-lg flex items-center justify-center shadow-inner">
                    <Plane
                      className="w-7 h-7 text-indigo-500 rotate-45"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Life */}
            <Card className="border border-zinc-100 shadow-sm rounded-2xl relative">
              <CardContent className="p-3.5">
                <h3 className="text-[14px] font-bold text-zinc-900 mb-0.5">
                  Life
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                >
                  0% GST
                </Badge>
                <div className="absolute bottom-2.5 right-2.5 w-12 h-12">
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-violet-50 rounded-lg flex items-center justify-center shadow-inner">
                    <Umbrella
                      className="w-7 h-7 text-purple-500"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Do more with ACKO Section */}
        <div className="px-4 pb-5">
          <h2
            className="text-[20px] font-bold text-zinc-900 mb-4"
            data-testid="text-section-domore"
          >
            Do more with ACKO
          </h2>

          {/* Nurture - Featured Card */}
          <Link href="/babycare">
            <Card
              className="bg-gradient-to-br from-pink-50 via-violet-50 to-white border border-pink-100 shadow-md rounded-2xl mb-4 cursor-pointer hover:shadow-lg transition-shadow"
              data-testid="card-featured-nurture"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-[16px] font-bold text-zinc-900 leading-tight">
                        Nurture
                      </h3>
                      <Badge className="bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:from-pink-500 hover:to-violet-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        New
                      </Badge>
                    </div>
                    <p className="text-[13px] text-zinc-600 leading-relaxed font-medium">
                      Complete care for new moms & babies
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Vaccines, growth tracking, recovery support & more
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-8 w-8"
                  >
                    <ArrowRight className="w-5 h-5 text-violet-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Utility Tiles Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Pay traffic challans */}
            <Card className="border border-zinc-100 shadow-sm rounded-2xl">
              <CardContent className="p-3 flex flex-col items-center text-center min-h-[95px]">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-2">
                  <Banknote className="w-5 h-5 text-violet-600" />
                </div>
                <h4 className="text-[11px] font-semibold text-zinc-900 leading-tight">
                  Pay traffic
                  <br />
                  challans
                </h4>
              </CardContent>
            </Card>

            {/* Check resale value */}
            <Card className="border border-zinc-100 shadow-sm rounded-2xl">
              <CardContent className="p-3 flex flex-col items-center text-center min-h-[95px]">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center mb-2">
                  <Car className="w-5 h-5 text-zinc-600" />
                </div>
                <h4 className="text-[11px] font-semibold text-zinc-900 leading-tight">
                  Check resale
                  <br />
                  value
                </h4>
              </CardContent>
            </Card>

            {/* Book car service */}
            <Card className="border border-zinc-100 shadow-sm rounded-2xl">
              <CardContent className="p-3 flex flex-col items-center text-center min-h-[95px]">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center mb-2">
                  <Wrench className="w-5 h-5 text-zinc-600" />
                </div>
                <h4 className="text-[11px] font-semibold text-zinc-900 leading-tight">
                  Book car
                  <br />
                  service
                </h4>
              </CardContent>
            </Card>

            {/* Get vehicle info */}
            <Card className="border border-zinc-100 shadow-sm rounded-2xl">
              <CardContent className="p-3 flex flex-col items-center text-center min-h-[95px]">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5 text-zinc-600" />
                </div>
                <h4 className="text-[11px] font-semibold text-zinc-900 leading-tight">
                  Get vehicle
                  <br />
                  info
                </h4>
              </CardContent>
            </Card>

            {/* Get ABHA card */}
            <Card className="border border-zinc-100 shadow-sm rounded-2xl">
              <CardContent className="p-3 flex flex-col items-center text-center min-h-[95px]">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center mb-2">
                  <CreditCard className="w-5 h-5 text-zinc-600" />
                </div>
                <h4 className="text-[11px] font-semibold text-zinc-900 leading-tight">
                  Get ABHA
                  <br />
                  card
                </h4>
              </CardContent>
            </Card>

            {/* Nurture - Tile */}
            <Link href="/babycare">
              <Card
                className="border border-pink-100 shadow-sm rounded-2xl cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-pink-50/50 to-violet-50/50"
                data-testid="card-utility-nurture"
              >
                <CardContent className="p-3 flex flex-col items-center text-center min-h-[95px]">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-violet-500 rounded-xl flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-[11px] font-semibold text-zinc-900 leading-tight">
                    Nurture
                  </h4>
                  <p className="text-[9px] text-zinc-500 mt-0.5 leading-tight">
                    Mom & baby care
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Discover all */}
            <Card className="border border-zinc-100 shadow-sm rounded-2xl">
              <CardContent className="p-3 flex flex-col items-center text-center min-h-[95px]">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center mb-2">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-[11px] font-semibold text-zinc-900 leading-tight">
                  Discover
                  <br />
                  all
                </h4>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Worry-free car ownership Section */}
        <div className="px-4 pb-5">
          <h2
            className="text-[20px] font-bold text-zinc-900 mb-4"
            data-testid="text-section-ownership"
          >
            Worry-free car ownership
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border border-zinc-100 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <h3 className="text-[14px] font-bold text-zinc-900 mb-1 leading-tight">
                  Servicing at
                  <br />
                  any garage
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                >
                  Free pickup & drop
                </Badge>
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full border-zinc-200"
                  >
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-zinc-100 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <h3 className="text-[14px] font-bold text-zinc-900 mb-1 leading-tight">
                  Explore your
                  <br />
                  next car
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                >
                  10,000+ cars
                </Badge>
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full border-zinc-200"
                  >
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* In the spotlight Section */}
        <div className="px-4 pb-5">
          <h2
            className="text-[20px] font-bold text-zinc-900 mb-4"
            data-testid="text-section-spotlight"
          >
            In the spotlight
          </h2>

          <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
            <div className="flex gap-3">
              <Card className="min-w-[280px] bg-gradient-to-br from-sky-100 via-cyan-50 to-white border-0 shadow-md rounded-2xl relative overflow-hidden">
                <CardContent className="p-5">
                  <h3 className="text-[18px] font-bold text-zinc-900 mb-1 leading-tight">
                    Get up to {"\u20B9"}600 OFF
                    <br />
                    on car insurance
                  </h3>
                  <p className="text-[12px] text-zinc-600 mb-4">
                    Use coupons for more savings
                  </p>
                  <Button className="bg-white text-zinc-900 hover:bg-zinc-50 rounded-full px-4 h-9 text-[13px] font-semibold gap-1.5 shadow-sm border border-zinc-200">
                    Insure now <ArrowRight className="w-4 h-4" />
                  </Button>
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-20">
                    <Car
                      className="w-full h-full text-cyan-500"
                      strokeWidth={0.5}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer Tagline */}
        <div className="px-4 py-10 text-center bg-gradient-to-b from-white via-violet-50/50 to-violet-100/30">
          <div className="mb-4 flex justify-center">
            <div className="w-24 h-24 flex items-center justify-center">
              <Umbrella className="w-20 h-20 text-violet-400" strokeWidth={1} />
            </div>
          </div>
          <p className="text-[20px] font-bold leading-tight">
            <span className="text-violet-600">The protection destination</span>
          </p>
          <p className="text-[20px] font-bold text-zinc-900">
            for millions of Indians
          </p>
        </div>
      </div>

      {/* Bottom Navigation - Acko Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 max-w-md mx-auto">
        <div className="flex items-center justify-around py-2 px-4">
          {/* Explore - Active */}
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 py-1.5 px-6 h-auto hover:bg-transparent"
            data-testid="nav-explore"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-violet-600 fill-violet-600/20" />
            </div>
            <span className="text-[11px] font-semibold text-violet-600">
              Explore
            </span>
          </Button>

          {/* Home */}
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 py-1.5 px-6 h-auto hover:bg-transparent"
            data-testid="nav-home"
          >
            <div className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center">
              <HomeIcon className="w-4 h-4 text-zinc-500" />
            </div>
            <span className="text-[11px] font-medium text-zinc-500">Home</span>
          </Button>

          {/* Support */}
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 py-1.5 px-6 h-auto hover:bg-transparent"
            data-testid="nav-support"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-zinc-400" />
            </div>
            <span className="text-[11px] font-medium text-zinc-500">
              Support
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
