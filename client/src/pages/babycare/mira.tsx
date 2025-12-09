import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  Send,
  User,
  Heart,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Home,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getProfiles, type Profile } from "@/lib/profileApi";
import { getUserId } from "@/lib/userId";
import {
  sendChatMessage,
  clearChatSession,
  type ParsedChatResponse,
} from "@/lib/chatApi";
import { useToast } from "@/hooks/use-toast";

const STARTER_PROMPTS = [
  "When should my baby start solid foods?",
  "How much sleep does my baby need?",
  "Is my baby's growth on track?",
  "Tips for teething pain relief",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  parsedResponse?: ParsedChatResponse;
}

export default function MiraChat() {
  const params = useParams();
  const babyId = params.babyId;
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch profiles from API
  const userId = getUserId();
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: [`/api/v1/profiles/user/${userId}`],
    queryFn: () => getProfiles(),
  });

  // Find baby profile - route param babyId is actually profileId
  const baby = profiles.find((p) => p.profileId === babyId);
  const babyProfileId = baby?.profileId || babyId; // Use profileId for navigation

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !babyProfileId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage(text);

      // Use parsed response if available, otherwise fallback to raw response
      const aiMessage = response.parsedResponse
        ? response.parsedResponse.summary
        : response.response ||
          "I'm here to help! Please try asking your question again.";

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiMessage,
        timestamp: new Date().toISOString(),
        parsedResponse: response.parsedResponse,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending chat message:", error);

      // Show error message to user
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

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
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col">
      {/* Warm Gradient Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-violet-500 text-white px-4 pt-4 pb-5">
        <div className="flex items-center gap-3">
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
              className="text-[18px] font-bold font-mono"
              data-testid="text-title"
            >
              AaI
            </h1>
            <p className="text-[12px] text-white/80">
              Here for you, like family
            </p>
          </div>
          <div
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            data-testid="icon-mira"
          >
            <Heart className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4 mb-24">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Heart className="w-10 h-10 text-rose-500" />
              </div>
              <h2
                className="text-[20px] font-bold text-zinc-900 mb-2"
                data-testid="text-welcome-heading"
              >
                Hi, I'm <span className="font-mono">AaI</span>
              </h2>
              <p
                className="text-[14px] text-zinc-600 text-center max-w-[280px] mb-2"
                data-testid="text-welcome-tagline"
              >
                You're not alone. I'm here for you.
              </p>
              <p
                className="text-[13px] text-zinc-500 text-center max-w-[280px] mb-6"
                data-testid="text-welcome-description"
              >
                Motherly comfort with pediatrician-level clarity. Ask me
                anything about {baby.babyName}'s health, feeding, sleep, or
                development.
              </p>

              {/* Starter Prompts */}
              <div className="w-full space-y-2">
                <p className="text-[12px] text-zinc-400 text-center mb-2">
                  Try asking:
                </p>
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="w-full p-3 text-left text-[13px] text-zinc-700 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 rounded-xl transition-colors border border-rose-100"
                    data-testid={`button-prompt-${idx}`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  data-testid={`message-${message.id}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-rose-500" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl rounded-br-md px-4 py-3"
                        : "bg-zinc-100 text-zinc-800 rounded-2xl rounded-bl-md"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="text-[14px] leading-relaxed">
                        {message.content}
                      </p>
                    ) : message.parsedResponse ? (
                      <div className="p-4 space-y-4">
                        {/* Summary */}
                        <p className="text-[14px] leading-relaxed text-zinc-800">
                          {message.parsedResponse.summary}
                        </p>

                        {/* Red Flags */}
                        {message.parsedResponse.redFlags &&
                          message.parsedResponse.redFlags.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                                <span className="text-[13px] font-semibold text-rose-700">
                                  Watch out for:
                                </span>
                              </div>
                              <ul className="space-y-1.5 pl-6">
                                {message.parsedResponse.redFlags.map(
                                  (flag, idx) => (
                                    <li
                                      key={idx}
                                      className="text-[13px] text-rose-600 list-disc"
                                    >
                                      {flag}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                        {/* Home Steps */}
                        {message.parsedResponse.homeSteps &&
                          message.parsedResponse.homeSteps.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Home className="w-4 h-4 text-emerald-500" />
                                <span className="text-[13px] font-semibold text-emerald-700">
                                  What you can do:
                                </span>
                              </div>
                              <ul className="space-y-1.5 pl-6">
                                {message.parsedResponse.homeSteps.map(
                                  (step, idx) => (
                                    <li
                                      key={idx}
                                      className="text-[13px] text-emerald-600 list-disc"
                                    >
                                      {step}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                        {/* Service Cards */}
                        {message.parsedResponse.serviceCards &&
                          message.parsedResponse.serviceCards.length > 0 && (
                            <div className="space-y-2 pt-2">
                              <div className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-violet-500" />
                                <span className="text-[13px] font-semibold text-violet-700">
                                  Recommended actions:
                                </span>
                              </div>
                              <div className="space-y-2">
                                {message.parsedResponse.serviceCards.map(
                                  (card, idx) => (
                                    <Card
                                      key={idx}
                                      className="bg-white border border-violet-200 rounded-xl overflow-hidden"
                                    >
                                      <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <p className="text-[13px] font-semibold text-zinc-900 mb-1">
                                              {card.title}
                                            </p>
                                            <Badge
                                              variant="outline"
                                              className="text-[11px] text-violet-600 border-violet-300"
                                            >
                                              {card.cta}
                                            </Badge>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-violet-400 flex-shrink-0 ml-2" />
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        {/* Disclaimer */}
                        {message.parsedResponse.disclaimer && (
                          <div className="pt-2 border-t border-zinc-200">
                            <p className="text-[11px] text-zinc-500 italic">
                              {message.parsedResponse.disclaimer}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[14px] leading-relaxed px-4 py-3">
                        {message.content}
                      </p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-zinc-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div
                  className="flex gap-3 justify-start"
                  data-testid="typing-indicator"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 px-4 py-4 border-t border-zinc-100 bg-white">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2"
            data-testid="form-message"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AaI anything..."
              className="flex-1 h-12 font-mono rounded-2xl bg-zinc-50 border-zinc-200 text-[14px] px-4"
              data-testid="input-message"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-12 w-12 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              data-testid="button-send"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p
            className="text-[10px] text-zinc-400 text-center mt-2"
            data-testid="text-disclaimer"
          >
            <span className="font-mono">AaI</span> provides guidance with care.
            For medical advice, consult your healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
}
