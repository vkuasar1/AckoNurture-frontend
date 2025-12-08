// Comprehensive vaccine information for the Nurture app
// Provides importance, benefits, side effects, and friendly messaging

export interface VaccineInfo {
  name: string;
  fullName: string;
  tagline: string; // Friendly one-liner
  importance: string;
  protectsAgainst: string[];
  benefits: string[];
  commonSideEffects: string[];
  whenToSeekHelp: string[];
  funFact?: string;
  icon: "shield" | "star" | "heart" | "sparkles";
}

// Detailed vaccine information database
export const VACCINE_INFO: Record<string, VaccineInfo> = {
  "BCG": {
    name: "BCG",
    fullName: "Bacillus Calmette-Guérin",
    tagline: "Baby's first shield against TB",
    importance: "BCG is one of the most important vaccines given at birth. It protects your baby from severe forms of tuberculosis, especially TB meningitis which can be life-threatening in young children.",
    protectsAgainst: ["Tuberculosis (TB)", "TB Meningitis", "Miliary TB"],
    benefits: [
      "Provides up to 80% protection against severe TB in children",
      "Single dose provides lifelong partial protection",
      "Safe and well-tested for over 100 years",
      "Prevents spread of TB in communities"
    ],
    commonSideEffects: [
      "Small raised bump at injection site (normal)",
      "A small scar may form after 2-3 months",
      "Mild swelling in armpit lymph nodes",
      "Low-grade fever (uncommon)"
    ],
    whenToSeekHelp: [
      "Severe swelling or pus at injection site",
      "High fever lasting more than 2 days",
      "Large painful lymph node swelling"
    ],
    funFact: "BCG vaccine has been protecting babies since 1921!",
    icon: "shield"
  },
  "Hepatitis B - Birth Dose": {
    name: "Hepatitis B",
    fullName: "Hepatitis B - Birth Dose",
    tagline: "Protecting tiny livers from day one",
    importance: "Given within 24 hours of birth, this vaccine protects your baby from hepatitis B virus which can cause serious liver damage. Early protection is crucial!",
    protectsAgainst: ["Hepatitis B virus", "Liver disease", "Liver cancer"],
    benefits: [
      "95% effective in preventing chronic hepatitis B",
      "Protects against liver cirrhosis and cancer",
      "Creates long-lasting immunity",
      "Safe for newborns"
    ],
    commonSideEffects: [
      "Mild soreness at injection site",
      "Low-grade fever (rare)",
      "Slight irritability for a day"
    ],
    whenToSeekHelp: [
      "High fever above 102°F (39°C)",
      "Severe allergic reaction (very rare)",
      "Unusual lethargy or poor feeding"
    ],
    icon: "heart"
  },
  "OPV - 0": {
    name: "OPV Zero",
    fullName: "Oral Polio Vaccine - Zero Dose",
    tagline: "Two sweet drops for a polio-free future",
    importance: "This oral vaccine given at birth is the first step in protecting your baby from polio, a disease that can cause permanent paralysis.",
    protectsAgainst: ["Poliomyelitis (Polio)", "Paralysis"],
    benefits: [
      "Easy to administer - just oral drops",
      "Helps achieve herd immunity",
      "Part of global polio eradication effort",
      "Works in the gut where polio virus enters"
    ],
    commonSideEffects: [
      "Generally no side effects",
      "Very rarely, mild diarrhea"
    ],
    whenToSeekHelp: [
      "Persistent diarrhea",
      "Any unusual weakness in limbs (very rare)"
    ],
    funFact: "India became polio-free in 2014 thanks to vaccines like this!",
    icon: "sparkles"
  },
  "DTwP/DTaP - 1": {
    name: "DTwP/DTaP",
    fullName: "Diphtheria, Tetanus & Pertussis - Dose 1",
    tagline: "Triple protection for your little one",
    importance: "This combination vaccine protects against three serious diseases in one shot, making it one of the most important vaccines in your baby's schedule.",
    protectsAgainst: ["Diphtheria", "Tetanus (Lockjaw)", "Pertussis (Whooping Cough)"],
    benefits: [
      "Protects against 3 dangerous diseases",
      "Highly effective when given on schedule",
      "Prevents severe breathing problems",
      "Essential for community protection"
    ],
    commonSideEffects: [
      "Mild fever (common)",
      "Fussiness for 1-2 days",
      "Swelling or redness at injection site",
      "Decreased appetite temporarily"
    ],
    whenToSeekHelp: [
      "Fever above 104°F (40°C)",
      "Non-stop crying for 3+ hours",
      "Seizures or convulsions",
      "Severe swelling of entire limb"
    ],
    icon: "shield"
  },
  "IPV - 1": {
    name: "IPV",
    fullName: "Inactivated Polio Vaccine - Dose 1",
    tagline: "Injectable protection against polio",
    importance: "IPV works alongside OPV to provide complete protection against polio. It's especially important for building strong blood-based immunity.",
    protectsAgainst: ["Poliomyelitis (All 3 types)", "Paralysis"],
    benefits: [
      "Cannot cause vaccine-derived polio",
      "Provides strong blood immunity",
      "Works together with OPV for complete protection",
      "Safe for immunocompromised children"
    ],
    commonSideEffects: [
      "Redness at injection site",
      "Mild pain or tenderness",
      "Low-grade fever (uncommon)"
    ],
    whenToSeekHelp: [
      "Severe allergic reaction",
      "High fever lasting more than 2 days"
    ],
    icon: "star"
  },
  "Hib - 1": {
    name: "Hib",
    fullName: "Haemophilus influenzae type b - Dose 1",
    tagline: "Guarding against serious bacterial infections",
    importance: "Hib vaccine protects against a bacteria that can cause meningitis, pneumonia, and other severe infections, especially dangerous for babies under 5.",
    protectsAgainst: ["Meningitis", "Pneumonia", "Epiglottitis", "Septic arthritis"],
    benefits: [
      "Prevents dangerous brain infections",
      "Reduces risk of hearing loss from meningitis",
      "Protects against blood infections",
      "Very safe with minimal side effects"
    ],
    commonSideEffects: [
      "Mild redness at injection site",
      "Slight swelling",
      "Low fever (uncommon)"
    ],
    whenToSeekHelp: [
      "High fever",
      "Unusual irritability or drowsiness"
    ],
    icon: "shield"
  },
  "Rotavirus - 1": {
    name: "Rotavirus",
    fullName: "Rotavirus Vaccine - Dose 1",
    tagline: "Sweet drops against tummy troubles",
    importance: "Rotavirus is the leading cause of severe diarrhea in babies. This oral vaccine prevents dehydration and hospitalizations from rotavirus infection.",
    protectsAgainst: ["Rotavirus gastroenteritis", "Severe diarrhea", "Dehydration"],
    benefits: [
      "Prevents severe dehydration episodes",
      "Reduces hospital visits for diarrhea",
      "Easy oral administration",
      "Protects during the most vulnerable months"
    ],
    commonSideEffects: [
      "Mild diarrhea (temporary)",
      "Slight fussiness",
      "Low fever (uncommon)"
    ],
    whenToSeekHelp: [
      "Severe or bloody diarrhea",
      "Signs of dehydration",
      "Persistent vomiting"
    ],
    funFact: "Rotavirus vaccines have prevented millions of hospitalizations worldwide!",
    icon: "sparkles"
  },
  "PCV - 1": {
    name: "PCV",
    fullName: "Pneumococcal Conjugate Vaccine - Dose 1",
    tagline: "Breathing easy, staying healthy",
    importance: "PCV protects against pneumococcal bacteria, a major cause of pneumonia, meningitis, and ear infections in young children.",
    protectsAgainst: ["Pneumonia", "Meningitis", "Ear infections", "Blood infections"],
    benefits: [
      "Prevents serious lung infections",
      "Reduces risk of ear infections",
      "Protects against bacterial meningitis",
      "Long-lasting immunity"
    ],
    commonSideEffects: [
      "Soreness at injection site",
      "Mild fever",
      "Decreased appetite for a day",
      "Slight irritability"
    ],
    whenToSeekHelp: [
      "High fever above 103°F",
      "Severe swelling at injection site",
      "Unusual drowsiness or difficulty breathing"
    ],
    icon: "heart"
  },
  "MMR - 1": {
    name: "MMR",
    fullName: "Measles, Mumps & Rubella - Dose 1",
    tagline: "Triple shield for growing explorers",
    importance: "MMR protects against three viral diseases that can cause serious complications. Given around 9-12 months when maternal antibodies fade.",
    protectsAgainst: ["Measles", "Mumps", "Rubella (German Measles)"],
    benefits: [
      "Prevents three diseases with one vaccine",
      "97% effective against measles after 2 doses",
      "Protects against serious complications",
      "Helps prevent community outbreaks"
    ],
    commonSideEffects: [
      "Mild fever 7-12 days after vaccination",
      "Slight rash (harmless)",
      "Mild swelling of glands",
      "Temporary joint stiffness (rare)"
    ],
    whenToSeekHelp: [
      "High fever with seizures",
      "Severe rash",
      "Signs of allergic reaction"
    ],
    funFact: "Measles vaccination has prevented over 21 million deaths since 2000!",
    icon: "star"
  },
  "Hepatitis A - 1": {
    name: "Hepatitis A",
    fullName: "Hepatitis A Vaccine - Dose 1",
    tagline: "Keeping little tummies safe",
    importance: "Hepatitis A spreads through contaminated food and water. This vaccine protects your growing child as they start eating varied foods.",
    protectsAgainst: ["Hepatitis A virus", "Liver inflammation", "Jaundice"],
    benefits: [
      "Long-lasting protection (possibly lifelong)",
      "Prevents severe liver inflammation",
      "Important as child's diet expands",
      "Protects during travel"
    ],
    commonSideEffects: [
      "Soreness at injection site",
      "Mild headache",
      "Low-grade fever",
      "Fatigue for a day"
    ],
    whenToSeekHelp: [
      "Severe allergic reaction",
      "High persistent fever"
    ],
    icon: "heart"
  },
  "Varicella - 1": {
    name: "Varicella",
    fullName: "Varicella (Chickenpox) Vaccine - Dose 1",
    tagline: "No more itchy nights",
    importance: "Chickenpox can cause severe complications in some children. The vaccine prevents the disease and its potential serious side effects.",
    protectsAgainst: ["Chickenpox (Varicella)", "Shingles later in life"],
    benefits: [
      "Prevents uncomfortable chickenpox",
      "Reduces risk of skin infections",
      "Prevents rare but serious complications",
      "May reduce shingles risk in adulthood"
    ],
    commonSideEffects: [
      "Soreness at injection site",
      "Very mild chickenpox-like rash (rare)",
      "Low-grade fever"
    ],
    whenToSeekHelp: [
      "Widespread rash",
      "Signs of allergic reaction",
      "High fever"
    ],
    icon: "sparkles"
  }
};

// Generic fallback info for vaccines not in our detailed database
export const getVaccineInfo = (vaccineName: string): VaccineInfo => {
  // Check for exact match
  if (VACCINE_INFO[vaccineName]) {
    return VACCINE_INFO[vaccineName];
  }
  
  // Check for partial matches (e.g., "DTwP/DTaP - 2" should match "DTwP/DTaP - 1" info)
  const baseName = vaccineName.replace(/ - \d+$/, " - 1");
  if (VACCINE_INFO[baseName]) {
    return {
      ...VACCINE_INFO[baseName],
      name: vaccineName.split(" - ")[0],
      fullName: vaccineName
    };
  }
  
  // Check for other patterns
  for (const key of Object.keys(VACCINE_INFO)) {
    if (vaccineName.toLowerCase().includes(key.toLowerCase().split(" - ")[0])) {
      return {
        ...VACCINE_INFO[key],
        name: vaccineName.split(" - ")[0],
        fullName: vaccineName
      };
    }
  }
  
  // Return generic info
  return {
    name: vaccineName,
    fullName: vaccineName,
    tagline: "Protecting your little one",
    importance: "This vaccine is part of the recommended immunization schedule to protect your baby from preventable diseases.",
    protectsAgainst: ["Disease as per medical guidelines"],
    benefits: [
      "Part of recommended vaccine schedule",
      "Helps build immunity",
      "Protects your child's health"
    ],
    commonSideEffects: [
      "Mild soreness at injection site",
      "Low-grade fever (possible)",
      "Slight fussiness"
    ],
    whenToSeekHelp: [
      "High fever above 103°F (39.5°C)",
      "Signs of severe allergic reaction",
      "Unusual symptoms lasting more than 48 hours"
    ],
    icon: "shield"
  };
};

// Friendly messages for vaccine states
export const VACCINE_MESSAGES = {
  overdue: {
    title: "Time to catch up!",
    subtitle: "Schedule this vaccine soon to keep your little one protected.",
    encouragement: "It's never too late to get back on track."
  },
  upcoming: {
    title: "Coming up soon",
    subtitle: "Mark your calendar for this important milestone!",
    encouragement: "You're doing great keeping up with the schedule."
  },
  done: {
    title: "Great job!",
    subtitle: "Another shield of protection for your baby.",
    encouragement: "Every vaccine is a step towards a healthier future."
  },
  dueToday: {
    title: "Due today!",
    subtitle: "Today's the day to protect your little one.",
    encouragement: "You've got this, super parent!"
  }
};

// Partner hospitals mock data
export interface PartnerHospital {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  vaccinePrice: number;
  consultationFee: number;
  isPartner: boolean;
  availableSlots: string[];
  phone: string;
}

export const MOCK_HOSPITALS: PartnerHospital[] = [
  {
    id: "apollo-cradle",
    name: "Apollo Cradle Hospital",
    address: "Jubilee Hills, Hyderabad",
    distance: "2.5 km",
    rating: 4.8,
    vaccinePrice: 1500,
    consultationFee: 500,
    isPartner: true,
    availableSlots: ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"],
    phone: "+91 40 2355 9090"
  },
  {
    id: "rainbow-children",
    name: "Rainbow Children's Hospital",
    address: "Banjara Hills, Hyderabad",
    distance: "3.2 km",
    rating: 4.9,
    vaccinePrice: 1800,
    consultationFee: 600,
    isPartner: true,
    availableSlots: ["9:30 AM", "12:00 PM", "3:00 PM"],
    phone: "+91 40 2349 0000"
  },
  {
    id: "fortis-la-femme",
    name: "Fortis La Femme",
    address: "Madhapur, Hyderabad",
    distance: "4.1 km",
    rating: 4.7,
    vaccinePrice: 1400,
    consultationFee: 500,
    isPartner: true,
    availableSlots: ["10:30 AM", "1:00 PM", "3:30 PM", "5:00 PM"],
    phone: "+91 40 6645 6789"
  },
  {
    id: "care-hospitals",
    name: "CARE Hospitals",
    address: "Hi-Tech City, Hyderabad",
    distance: "5.5 km",
    rating: 4.6,
    vaccinePrice: 1350,
    consultationFee: 450,
    isPartner: false,
    availableSlots: ["11:00 AM", "2:30 PM", "4:00 PM"],
    phone: "+91 40 3026 0000"
  }
];
