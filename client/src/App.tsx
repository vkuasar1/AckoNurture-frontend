import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ExplorePage from "@/pages/explore";
import BabyCareWelcome from "@/pages/babycare/welcome";
import BabyCareHospitalWelcome from "@/pages/babycare/hospital-welcome";
import BabyCareProfileSetup from "@/pages/babycare/profile-setup";
import BabyCareOnboarding from "@/pages/babycare/onboarding";
import BabyCareHome from "@/pages/babycare/home";
import BabyDashboard from "@/pages/babycare/baby-dashboard";
import BabyCareVaccines from "@/pages/babycare/vaccines";
import BabyCareGrowth from "@/pages/babycare/growth";
import BabyCareMilestones from "@/pages/babycare/milestones";
import MiraChat from "@/pages/babycare/mira";
import BabyCareMedicalRecords from "@/pages/babycare/medical-records";
import Appointments from "@/pages/babycare/appointments";
import Resources from "@/pages/babycare/resources";
import BabyCarePlans from "@/pages/babycare/plans";
import ParentCommunity from "@/pages/babycare/parent-community";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ExplorePage} />
      <Route path="/babycare" component={BabyCareWelcome} />
      <Route path="/babycare/hospital" component={BabyCareHospitalWelcome} />
      <Route path="/babycare/setup" component={BabyCareProfileSetup} />
      <Route path="/babycare/onboarding" component={BabyCareOnboarding} />
      <Route path="/babycare/home" component={BabyCareHome} />
      <Route path="/babycare/home/:babyId" component={BabyCareHome} />
      <Route path="/babycare/dashboard/:babyId" component={BabyDashboard} />
      <Route path="/babycare/vaccines/:babyId" component={BabyCareVaccines} />
      <Route path="/babycare/growth/:babyId" component={BabyCareGrowth} />
      <Route
        path="/babycare/milestones/:babyId"
        component={BabyCareMilestones}
      />
      <Route path="/babycare/mira/:babyId" component={MiraChat} />
      <Route path="/babycare/mira" component={MiraChat} />
      <Route
        path="/babycare/records/:babyId"
        component={BabyCareMedicalRecords}
      />
      <Route path="/babycare/appointments/:babyId" component={Appointments} />
      <Route path="/babycare/resources" component={Resources} />
      <Route path="/babycare/plans" component={BabyCarePlans} />
      <Route path="/babycare/community/:babyId" component={ParentCommunity} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
