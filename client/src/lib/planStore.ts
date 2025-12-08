// Simple localStorage-based plan store for prototype
// In production, this would come from user's subscription data via API

export type ChildPlanType = "digital" | "vaccination" | "premium" | null;
export type MotherPlanType = "recovery" | "wellness" | null;
export type ComboPlanType = "digital" | "essential" | "premium" | null;

export interface ActivePlans {
  childPlan: ChildPlanType;
  motherPlan: MotherPlanType;
  comboPlan: ComboPlanType;
}

const PLAN_STORAGE_KEY = "babycare_active_plans";

export function getActivePlans(): ActivePlans {
  if (typeof window === "undefined") {
    return { childPlan: null, motherPlan: null, comboPlan: null };
  }
  
  try {
    const stored = localStorage.getItem(PLAN_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse stored plans:", e);
  }
  
  return { childPlan: null, motherPlan: null, comboPlan: null };
}

export function setActivePlans(plans: Partial<ActivePlans>): void {
  if (typeof window === "undefined") return;
  
  const current = getActivePlans();
  const updated = { ...current, ...plans };
  
  try {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save plans:", e);
  }
}

export function clearActivePlans(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PLAN_STORAGE_KEY);
}

// Plan details for display
export const childPlanDetails = {
  digital: {
    name: "Child Digital Wellness Pack",
    shortDescription: "Includes AI Nanny, tracking tools and more.",
    price: "₹999/year",
    benefits: [
      "Full BabyCare digital product",
      "Unlimited AI Nanny",
      "Vaccine tracking + logs",
      "Growth tracking (no percentiles)",
      "Monthly wellness summary"
    ]
  },
  vaccination: {
    name: "Vaccination & Checkup Pack",
    shortDescription: "Vaccines, checkups and digital tracking tools.",
    price: "₹5,999/year",
    benefits: [
      "Everything in Digital Pack",
      "Vaccines at partner hospital",
      "2 pediatric checkups",
      "Appointment assistance"
    ]
  },
  premium: {
    name: "Premium Growth Care Pack",
    shortDescription: "Complete care with nanny support and consults.",
    price: "₹11,999/year",
    benefits: [
      "Everything in Vaccination Pack",
      "Limited nanny support (3 calls/month)",
      "1 child nutrition consult",
      "1 sleep guidance session"
    ]
  }
};

export const motherPlanDetails = {
  recovery: {
    name: "Mother Recovery Pack",
    shortDescription: "Video consults for postpartum recovery.",
    price: "₹1,999 (one-time)",
    benefits: [
      "Postpartum recovery tips",
      "1 lactation consult (video)",
      "1 physiotherapy consult (video)"
    ]
  },
  wellness: {
    name: "Mother Wellness Care Pack",
    shortDescription: "Comprehensive care with in-person support.",
    price: "₹4,999 (one-time)",
    benefits: [
      "Everything in Recovery Pack",
      "1 in-person physio session (or extra video)",
      "1 mental wellness consultation",
      "Basic nutrition guidance"
    ]
  }
};

export const comboPlanDetails = {
  digital: {
    name: "Digital Wellness Combo",
    shortDescription: "Digital tools for both baby and mother.",
    price: "₹2,499/year",
    childPart: "Child Digital Wellness Pack",
    motherPart: "Mother Recovery Pack (digital)"
  },
  essential: {
    name: "Essential Care Combo",
    shortDescription: "Vaccines, checkups and recovery support.",
    price: "₹7,999/year",
    childPart: "Vaccination & Checkup Pack",
    motherPart: "Mother Recovery Pack"
  },
  premium: {
    name: "Premium Care Combo",
    shortDescription: "Complete care for the whole family.",
    price: "₹13,999/year",
    childPart: "Premium Growth Care Pack",
    motherPart: "Mother Wellness Care Pack"
  }
};

// Helper to get the effective child plan (either direct or from combo)
export function getEffectiveChildPlan(plans: ActivePlans): ChildPlanType | "combo-digital" | "combo-essential" | "combo-premium" {
  if (plans.comboPlan) {
    return `combo-${plans.comboPlan}` as "combo-digital" | "combo-essential" | "combo-premium";
  }
  return plans.childPlan;
}

// Helper to get the effective mother plan (either direct or from combo)
export function getEffectiveMotherPlan(plans: ActivePlans): MotherPlanType | "combo-digital" | "combo-essential" | "combo-premium" {
  if (plans.comboPlan) {
    return `combo-${plans.comboPlan}` as "combo-digital" | "combo-essential" | "combo-premium";
  }
  return plans.motherPlan;
}

// Check if user has any baby-related plan
export function hasChildPlan(plans: ActivePlans): boolean {
  return plans.childPlan !== null || plans.comboPlan !== null;
}

// Check if user has any mother-related plan
export function hasMotherPlan(plans: ActivePlans): boolean {
  return plans.motherPlan !== null || plans.comboPlan !== null;
}
