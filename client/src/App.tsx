import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ExplorePage from "@/pages/explore";
import BabyCareWelcome from "@/pages/babycare/welcome";
import BabyCareHospitalWelcome from "@/pages/babycare/hospital-welcome";
import BabyCareProfileSetup from "@/pages/babycare/profile-setup";
import BabyCareHome from "@/pages/babycare/home";
import BabyCareVaccines from "@/pages/babycare/vaccines";
import BabyCareGrowth from "@/pages/babycare/growth";
import BabyCareMilestones from "@/pages/babycare/milestones";
import BabyCareAiNanny from "@/pages/babycare/ai-nanny";
import BabyCareMedicalRecords from "@/pages/babycare/medical-records";
import MotherAIChat from "@/pages/babycare/mother-ai-chat";
import MotherRecords from "@/pages/babycare/mother-records";
import MentalWellness from "@/pages/babycare/mental-wellness";
import Resources from "@/pages/babycare/resources";
import BabyCarePlans from "@/pages/babycare/plans";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ExplorePage} />
      <Route path="/babycare" component={BabyCareWelcome} />
      <Route path="/babycare/hospital" component={BabyCareHospitalWelcome} />
      <Route path="/babycare/setup" component={BabyCareProfileSetup} />
      <Route path="/babycare/home" component={BabyCareHome} />
      <Route path="/babycare/home/:babyId" component={BabyCareHome} />
      <Route path="/babycare/vaccines/:babyId" component={BabyCareVaccines} />
      <Route path="/babycare/growth/:babyId" component={BabyCareGrowth} />
      <Route path="/babycare/milestones/:babyId" component={BabyCareMilestones} />
      <Route path="/babycare/ai-nanny/:babyId" component={BabyCareAiNanny} />
      <Route path="/babycare/records/:babyId" component={BabyCareMedicalRecords} />
      <Route path="/babycare/mother-ai-chat" component={MotherAIChat} />
      <Route path="/babycare/mother-records" component={MotherRecords} />
      <Route path="/babycare/mental-wellness" component={MentalWellness} />
      <Route path="/babycare/resources" component={Resources} />
      <Route path="/babycare/plans" component={BabyCarePlans} />
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
