import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import {
  ArrowLeft,
  Users,
  Video,
  MessageCircle,
  Star,
  Clock,
  Calendar,
  Check,
  ChevronRight,
  Send,
  Heart,
  Shield,
  Sparkles,
  Baby,
  Search,
  Filter,
  CreditCard,
  CheckCircle2,
  Phone,
  Globe,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const ANONYMOUS_NAMES = [
  "Caring Parent",
  "Hopeful Heart",
  "Gentle Soul",
  "Warm Spirit",
  "Kind Mind",
  "Tender Heart",
  "Loving Parent",
  "Peaceful Mind",
  "Bright Hope",
  "Calm Spirit",
  "Sweet Soul",
  "Wise Heart",
];

const ANONYMOUS_MENTOR_NAMES = [
  "Supportive Guide",
  "Caring Mentor",
  "Experienced Parent",
  "Gentle Advisor",
];

function getRandomAnonymousName(): string {
  return ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)];
}

function getRandomMentorName(): string {
  return ANONYMOUS_MENTOR_NAMES[
    Math.floor(Math.random() * ANONYMOUS_MENTOR_NAMES.length)
  ];
}

type FlowStep =
  | "describe"
  | "choose"
  | "mentors"
  | "schedule"
  | "payment"
  | "confirmation"
  | "community";

interface ParentMentor {
  id: string;
  name: string;
  avatar: string;
  specialty: string[];
  rating: number;
  reviews: number;
  experience: string;
  languages: string[];
  pricePerSession: number;
  bio: string;
  availability: string[];
}

interface CommunityMessage {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  isCurrentUser?: boolean;
}

const PARENT_MENTORS: ParentMentor[] = [
  {
    id: "mentor-1",
    name: "Priya Sharma",
    avatar: "",
    specialty: [
      "Developmental Milestones",
      "Sleep Training",
      "First-time Parenting",
    ],
    rating: 4.9,
    reviews: 127,
    experience: "Mother of 2, 6 years experience",
    languages: ["English", "Hindi"],
    pricePerSession: 299,
    bio: "I understand the anxiety of watching for milestones. Been there with both my kids!",
    availability: [
      "Today 4:00 PM",
      "Today 6:00 PM",
      "Tomorrow 10:00 AM",
      "Tomorrow 2:00 PM",
    ],
  },
  {
    id: "mentor-2",
    name: "Anjali Reddy",
    avatar: "",
    specialty: ["Motor Development", "Feeding", "Premature Baby Care"],
    rating: 4.8,
    reviews: 89,
    experience: "Mother of twins, Pediatric nurse background",
    languages: ["English", "Telugu", "Hindi"],
    pricePerSession: 349,
    bio: "My twins were preemies. I know how worrying delayed milestones can feel.",
    availability: ["Today 5:30 PM", "Tomorrow 11:00 AM", "Tomorrow 3:00 PM"],
  },
  {
    id: "mentor-3",
    name: "Meera Kapoor",
    avatar: "",
    specialty: [
      "Speech & Communication",
      "Social Development",
      "Autism Awareness",
    ],
    rating: 5.0,
    reviews: 64,
    experience: "Mother of 1, Child development specialist",
    languages: ["English", "Hindi", "Marathi"],
    pricePerSession: 399,
    bio: "Every child has their own timeline. Let me help you understand yours.",
    availability: ["Tomorrow 9:00 AM", "Tomorrow 4:00 PM", "Dec 11 10:00 AM"],
  },
  {
    id: "mentor-4",
    name: "Sneha Iyer",
    avatar: "",
    specialty: [
      "Cognitive Development",
      "Play-based Learning",
      "Anxiety Management",
    ],
    rating: 4.7,
    reviews: 156,
    experience: "Mother of 3, Early childhood educator",
    languages: ["English", "Tamil", "Kannada"],
    pricePerSession: 279,
    bio: "15 years of working with kids taught me that comparison is the thief of joy.",
    availability: ["Today 7:00 PM", "Tomorrow 8:00 AM", "Tomorrow 1:00 PM"],
  },
];

const INITIAL_COMMUNITY_MESSAGES: CommunityMessage[] = [
  {
    id: "msg-1",
    author: "Ritu M.",
    avatar: "",
    content:
      "Welcome to the milestone support group! Feel free to share your concerns. We're all in this together.",
    time: "Pinned",
  },
  {
    id: "msg-2",
    author: "Kavita S.",
    avatar: "",
    content:
      "My 4-month-old just started recognizing voices yesterday! Keep the faith, mamas!",
    time: "2 hours ago",
  },
  {
    id: "msg-3",
    author: "Deepa R.",
    avatar: "",
    content:
      "Anyone else's baby taking longer with social smiling? My pediatrician said it's normal but I can't help worrying.",
    time: "3 hours ago",
  },
];

interface UpcomingConsultation {
  mentorName: string;
  mentorInitials: string;
  dateTime: string;
  topic: string;
}

interface ActiveChat {
  lastMessage: string;
  unreadCount: number;
  lastActivity: string;
}

export default function ParentCommunity() {
  const params = useParams();
  const [, navigate] = useLocation();
  const babyId = params.babyId;
  const { toast } = useToast();

  const [step, setStep] = useState<FlowStep>("describe");
  const [concern, setConcern] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<ParentMentor | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [communityMessages, setCommunityMessages] = useState<
    CommunityMessage[]
  >(INITIAL_COMMUNITY_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousUserName] = useState(() => getRandomAnonymousName());
  const [anonymousMentorName] = useState(() => getRandomMentorName());

  // Mock data for upcoming consultation and active chat (set to null to hide)
  const [upcomingConsultation] = useState<UpcomingConsultation | null>({
    mentorName: "Priya Sharma",
    mentorInitials: "PS",
    dateTime: "Today 4:00 PM",
    topic: "Developmental milestones",
  });

  const [activeChat] = useState<ActiveChat | null>({
    lastMessage:
      "I totally understand how you feel! My little one was the same...",
    unreadCount: 3,
    lastActivity: "2 min ago",
  });

  const handleDescribeNext = () => {
    if (concern.trim().length < 10) {
      toast({
        title: "Tell us more",
        description: "Please describe your concern in a bit more detail",
        variant: "destructive",
      });
      return;
    }
    setStep("choose");
  };

  const handleChooseVideoCall = () => {
    setStep("mentors");
  };

  const handleChooseCommunity = () => {
    const displayName = isAnonymous ? anonymousUserName : "You";
    const autoMessage = `Hi everyone! I'm looking for some advice. ${concern}. Has anyone experienced something similar?`;
    setCommunityMessages((prev) => [
      ...prev,
      {
        id: `msg-user-${Date.now()}`,
        author: displayName,
        avatar: "",
        content: autoMessage,
        time: "Just now",
        isCurrentUser: true,
      },
    ]);
    setStep("community");
  };

  const handleSelectMentor = (mentor: ParentMentor) => {
    setSelectedMentor(mentor);
    setStep("schedule");
  };

  const handleSelectSlot = (slot: string) => {
    setSelectedSlot(slot);
    setStep("payment");
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessingPayment(false);
    setStep("confirmation");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const displayName = isAnonymous ? anonymousUserName : "You";
    setCommunityMessages((prev) => [
      ...prev,
      {
        id: `msg-user-${Date.now()}`,
        author: displayName,
        avatar: "",
        content: newMessage,
        time: "Just now",
        isCurrentUser: true,
      },
    ]);
    setNewMessage("");

    setTimeout(() => {
      const replyName = isAnonymous ? getRandomAnonymousName() : "Nisha P.";
      setCommunityMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          author: replyName,
          avatar: "",
          content:
            "I totally understand how you feel! My little one was the same. Hang in there!",
          time: "Just now",
        },
      ]);
    }, 2000);
  };

  const handleBack = () => {
    switch (step) {
      case "choose":
        setStep("describe");
        break;
      case "mentors":
        setStep("choose");
        break;
      case "schedule":
        setStep("mentors");
        break;
      case "payment":
        setStep("schedule");
        break;
      case "community":
        setStep("choose");
        break;
      default:
        window.history.back();
    }
  };

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col">
      <div className="bg-purple-600 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full"
            onClick={handleBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-[16px] font-bold">
              {step === "community"
                ? "Parent Community"
                : "Connect with Parents"}
            </h1>
            <p className="text-[11px] text-purple-200">
              {step === "community"
                ? "Share, learn, grow together"
                : "You're not alone in this journey"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === "describe" && (
            <motion.div
              key="describe"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-[18px] font-bold text-zinc-900">
                  We're here for you
                </h2>
                <p className="text-[13px] text-zinc-500 mt-2">
                  Connect with parents who've been through similar experiences
                </p>
              </div>

              <Card className="border-purple-100">
                <CardContent className="p-4">
                  <label className="text-[13px] font-medium text-zinc-700 block mb-2">
                    What's on your mind?
                  </label>
                  <Textarea
                    placeholder="E.g., My baby is 4 months old and hasn't started recognizing voices yet. I'm feeling a bit worried..."
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    className="min-h-[120px] text-[14px] resize-none"
                    data-testid="input-concern"
                  />
                  <p className="text-[11px] text-zinc-400 mt-2">
                    This helps us connect you with the right parents and
                    community
                  </p>
                </CardContent>
              </Card>

              <div className="mt-4 space-y-2">
                <p className="text-[12px] font-medium text-zinc-600">
                  Quick topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Delayed milestones",
                    "Sleep concerns",
                    "Feeding issues",
                    "Social development",
                  ].map((topic) => (
                    <button
                      key={topic}
                      onClick={() =>
                        setConcern((prev) =>
                          prev ? `${prev} ${topic}` : topic,
                        )
                      }
                      className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[11px] font-medium border border-purple-100"
                      data-testid={`topic-${topic.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span className="text-[13px] font-medium text-zinc-700">
                    Go anonymous
                  </span>
                </div>
                <Switch
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                  data-testid="switch-anonymous"
                />
              </div>

              <Button
                onClick={handleDescribeNext}
                className="w-full bg-purple-600 hover:bg-purple-700"
                data-testid="button-continue"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              {/* Upcoming Consultation & Active Chat Section - Below Continue CTA */}
              {(upcomingConsultation || activeChat) && (
                <div className="mt-6 space-y-3">
                  {upcomingConsultation && (
                    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-[13px] font-semibold text-zinc-900">
                                Upcoming Call
                              </h3>
                              <Badge
                                variant="secondary"
                                className="text-[9px] bg-purple-100 text-purple-700"
                              >
                                Scheduled
                              </Badge>
                            </div>
                            <p className="text-[12px] text-zinc-600 mt-0.5">
                              with {upcomingConsultation.mentorName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-purple-500" />
                              <span className="text-[11px] font-medium text-purple-600">
                                {upcomingConsultation.dateTime}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-[12px]"
                            data-testid="button-join-call"
                          >
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeChat && (
                    <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                            <MessageCircle className="w-6 h-6 text-white" />
                            {activeChat.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {activeChat.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-[13px] font-semibold text-zinc-900">
                                Community Chat
                              </h3>
                              <Badge
                                variant="secondary"
                                className="text-[9px] bg-emerald-100 text-emerald-700"
                              >
                                Active
                              </Badge>
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                              {activeChat.lastMessage}
                            </p>
                            <span className="text-[10px] text-zinc-400">
                              {activeChat.lastActivity}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[12px]"
                            onClick={() => setStep("community")}
                            data-testid="button-continue-chat"
                          >
                            Continue
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === "choose" && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-[18px] font-bold text-zinc-900">
                  How would you like to connect?
                </h2>
                <p className="text-[13px] text-zinc-500 mt-2">
                  Choose what works best for you right now
                </p>
              </div>

              {isAnonymous && (
                <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span className="text-[12px] text-purple-700 font-medium">
                      Anonymous mode: You'll appear as "{anonymousUserName}"
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleChooseVideoCall}
                  className="w-full text-left"
                  data-testid="button-video-call"
                >
                  <Card className="border-purple-200 hover:border-purple-400 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          {isAnonymous ? (
                            <Phone className="w-6 h-6 text-white" />
                          ) : (
                            <Video className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-semibold text-zinc-900">
                              {isAnonymous
                                ? "1:1 Voice Call"
                                : "1:1 Video Call"}
                            </h3>
                            {isAnonymous && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] bg-purple-100 text-purple-700"
                              >
                                Anonymous
                              </Badge>
                            )}
                          </div>
                          <p className="text-[12px] text-zinc-500 mt-1">
                            {isAnonymous
                              ? "Private voice session with an experienced parent mentor — no camera needed"
                              : "Private video session with an experienced parent mentor"}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                              <Clock className="w-3 h-3" />
                              30 min session
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-300" />
                      </div>
                    </CardContent>
                  </Card>
                </button>

                <button
                  onClick={handleChooseCommunity}
                  className="w-full text-left"
                  data-testid="button-community-chat"
                >
                  <Card className="border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-semibold text-zinc-900">
                              Community Chat
                            </h3>
                            <Badge
                              variant="secondary"
                              className="text-[9px] bg-emerald-100 text-emerald-700"
                            >
                              Free
                            </Badge>
                          </div>
                          <p className="text-[12px] text-zinc-500 mt-1">
                            Join our supportive community of parents going
                            through similar journeys
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                              <Users className="w-3 h-3" />
                              2,400+ parents
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                              Always available
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-300" />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] font-medium text-purple-800">
                      Safe & Supportive Space
                    </p>
                    <p className="text-[11px] text-purple-600 mt-0.5">
                      All our parent mentors are verified and our community is
                      moderated 24/7
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "mentors" && (
            <motion.div
              key="mentors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <div className="mb-4">
                <h2 className="text-[16px] font-bold text-zinc-900">
                  Parent Mentors
                </h2>
                <p className="text-[12px] text-zinc-500 mt-1">
                  Experienced parents who understand your concerns
                </p>
              </div>

              <div className="space-y-3">
                {PARENT_MENTORS.map((mentor) => (
                  <button
                    key={mentor.id}
                    onClick={() => handleSelectMentor(mentor)}
                    className="w-full text-left"
                    data-testid={`mentor-${mentor.id}`}
                  >
                    <Card className="border-zinc-200 hover:border-purple-300 hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={mentor.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-[14px] font-semibold">
                              {mentor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-[14px] font-semibold text-zinc-900">
                                {mentor.name}
                              </h3>
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span className="text-[12px] font-medium text-zinc-700">
                                  {mentor.rating}
                                </span>
                                <span className="text-[11px] text-zinc-400">
                                  ({mentor.reviews})
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              {mentor.experience}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {mentor.specialty.slice(0, 2).map((s) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[10px]"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center mt-2">
                              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                                <Globe className="w-3 h-3" />
                                {mentor.languages.join(", ")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "schedule" && selectedMentor && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <Card className="border-purple-200 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-[16px] font-semibold">
                        {selectedMentor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-[15px] font-semibold text-zinc-900">
                        {selectedMentor.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-[12px] text-zinc-600">
                          {selectedMentor.rating} ({selectedMentor.reviews}{" "}
                          reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[12px] text-zinc-600 mt-3 italic">
                    "{selectedMentor.bio}"
                  </p>
                </CardContent>
              </Card>

              <div className="mb-4">
                <h2 className="text-[16px] font-bold text-zinc-900">
                  Select a time slot
                </h2>
                <p className="text-[12px] text-zinc-500 mt-1">
                  30-minute video session
                </p>
              </div>

              <div className="space-y-2">
                {selectedMentor.availability.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleSelectSlot(slot)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                      selectedSlot === slot
                        ? "border-purple-500 bg-purple-50"
                        : "border-zinc-200 bg-white hover:border-purple-300"
                    }`}
                    data-testid={`slot-${slot.replace(/\s/g, "-")}`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <span className="text-[14px] font-medium text-zinc-800">
                        {slot}
                      </span>
                    </div>
                    {selectedSlot === slot && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </button>
                ))}
              </div>

              <Button
                onClick={() => selectedSlot && setStep("payment")}
                disabled={!selectedSlot}
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                data-testid="button-confirm-slot"
              >
                Continue to Payment
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {step === "payment" && selectedMentor && selectedSlot && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <div className="mb-6">
                <h2 className="text-[16px] font-bold text-zinc-900">
                  Confirm & Pay
                </h2>
                <p className="text-[12px] text-zinc-500 mt-1">
                  Secure payment powered by Acko
                </p>
              </div>

              <Card className="border-zinc-200 mb-4">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-zinc-600">
                      Session with
                    </span>
                    <span className="text-[13px] font-medium text-zinc-900">
                      {selectedMentor.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-zinc-600">
                      Date & Time
                    </span>
                    <span className="text-[13px] font-medium text-zinc-900">
                      {selectedSlot}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-zinc-600">Duration</span>
                    <span className="text-[13px] font-medium text-zinc-900">
                      30 minutes
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-zinc-500" />
                    <span className="text-[13px] font-medium text-zinc-700">
                      Payment Method
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-purple-50 border-2 border-purple-500 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[13px] font-medium text-zinc-800">
                          UPI / Google Pay
                        </span>
                      </div>
                      <Check className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="w-full bg-purple-600 hover:bg-purple-700"
                data-testid="button-pay"
              >
                {isProcessingPayment ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>Confirm Booking</>
                )}
              </Button>

              <p className="text-[11px] text-zinc-400 text-center mt-3">
                By proceeding, you agree to our Terms of Service
              </p>
            </motion.div>
          )}

          {step === "confirmation" && selectedMentor && selectedSlot && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-[20px] font-bold text-zinc-900 text-center">
                You're all set!
              </h2>
              <p className="text-[14px] text-zinc-500 text-center mt-2 max-w-[280px]">
                Your video call with {selectedMentor.name} is confirmed
              </p>

              <Card className="border-purple-200 mt-6 w-full">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-purple-600">
                    <Calendar className="w-5 h-5" />
                    <span className="text-[15px] font-semibold">
                      {selectedSlot}
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-2">
                    You'll receive a call link via SMS and email
                  </p>
                </CardContent>
              </Card>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl w-full">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-medium text-amber-800">
                      Prepare for your call
                    </p>
                    <p className="text-[11px] text-amber-600 mt-0.5">
                      Write down any specific questions you'd like to ask.{" "}
                      {selectedMentor.name} is here to help!
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate(`/babycare/milestones/${babyId}`)}
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                data-testid="button-done"
              >
                Back to Milestones
              </Button>
            </motion.div>
          )}

          {step === "community" && (
            <motion.div
              key="community"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-[calc(100vh-72px)]"
            >
              <div className="p-3 bg-purple-50 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-purple-700 font-medium">
                    2,400+ parents in this group
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {communityMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.isCurrentUser ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback
                        className={`text-[10px] font-semibold ${
                          msg.isCurrentUser
                            ? "bg-purple-600 text-white"
                            : "bg-gradient-to-br from-pink-400 to-purple-400 text-white"
                        }`}
                      >
                        {msg.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex-1 max-w-[80%] ${msg.isCurrentUser ? "text-right" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.isCurrentUser && (
                          <span className="text-[12px] font-medium text-zinc-700">
                            {msg.author}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400">
                          {msg.time}
                        </span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-[13px] ${
                          msg.isCurrentUser
                            ? "bg-purple-600 text-white rounded-tr-sm"
                            : "bg-white border border-zinc-200 text-zinc-700 rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                    data-testid="input-message"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
