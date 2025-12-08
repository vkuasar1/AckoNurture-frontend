import { Link } from "wouter";
import { ArrowLeft, Heart, Send, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
};

const SIMULATED_RESPONSES: Record<string, string> = {
  default: "I understand how you're feeling. Recovery takes time, and every journey is unique. Remember to be gentle with yourself. Would you like me to share some tips that might help?",
  back: "Back pain is very common in the postpartum period. Your body went through a lot during pregnancy and delivery. Try gentle stretches, use a heating pad, and make sure you have good posture while feeding. If the pain persists or is severe, please consult your doctor.",
  sleep: "Sleep deprivation is one of the toughest parts of early motherhood. Try to rest when your baby rests, even if you can't sleep. Accept help from family and friends. Remember, this phase is temporary. Your body and baby will eventually settle into a routine.",
  breastfeeding: "Breastfeeding can be challenging, especially in the early weeks. Make sure you're comfortable, try different positions, and don't hesitate to ask for help from a lactation consultant. Pain during feeding isn't normal and should be addressed. You're doing great!",
  mood: "It's completely normal to experience a range of emotions after having a baby. The 'baby blues' affect many new mothers. However, if you're feeling persistently sad, anxious, or overwhelmed for more than two weeks, please talk to your healthcare provider. You're not alone in this.",
  tired: "Feeling exhausted is completely understandable. Your body has been through so much, and now you're caring for a newborn around the clock. Prioritize rest when you can, stay hydrated, eat nourishing foods, and don't hesitate to ask for help. This fatigue will improve with time.",
  exercise: "It's wonderful that you're thinking about exercise! Start slowly with gentle walks and pelvic floor exercises. Most doctors recommend waiting 6-8 weeks before resuming more intense activity. Listen to your body and don't push too hard. Your core muscles need time to heal.",
};

function getSimulatedResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  if (message.includes("back") || message.includes("pain") || message.includes("ache")) {
    return SIMULATED_RESPONSES.back;
  }
  if (message.includes("sleep") || message.includes("tired") || message.includes("exhausted")) {
    return message.includes("tired") || message.includes("exhausted") 
      ? SIMULATED_RESPONSES.tired 
      : SIMULATED_RESPONSES.sleep;
  }
  if (message.includes("breastfeed") || message.includes("nursing") || message.includes("lactation") || message.includes("milk")) {
    return SIMULATED_RESPONSES.breastfeeding;
  }
  if (message.includes("mood") || message.includes("sad") || message.includes("anxious") || message.includes("cry") || message.includes("depress")) {
    return SIMULATED_RESPONSES.mood;
  }
  if (message.includes("exercise") || message.includes("workout") || message.includes("gym") || message.includes("fitness")) {
    return SIMULATED_RESPONSES.exercise;
  }
  return SIMULATED_RESPONSES.default;
}

export default function MotherAIChat() {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi, I'm here to support you with postpartum recovery—body, sleep, mood, breastfeeding and more. How are you feeling today?",
      timestamp: new Date(),
    },
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: getSimulatedResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-[#1a1a1a] text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/babycare/home?tab=mother" data-testid="link-back">
          <button className="p-1.5 -ml-1.5 hover:bg-white/10 rounded-lg transition-colors" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold" data-testid="text-page-title">AI Nanny – For You</h1>
            <p className="text-[12px] text-zinc-400">Your recovery companion</p>
          </div>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-center gap-2" data-testid="disclaimer-banner">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-[12px] text-amber-700 leading-tight">
          AI Nanny does not replace a doctor. For emergencies, please contact a healthcare provider.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <Sparkles className="w-4 h-4 text-pink-600" />
              </div>
            )}
            <Card
              className={`max-w-[85%] border-0 shadow-sm rounded-2xl ${
                message.role === "user"
                  ? "bg-pink-600 text-white"
                  : "bg-white border border-zinc-100"
              }`}
              data-testid={`message-${message.id}`}
            >
              <CardContent className="p-3">
                <p
                  className={`text-[14px] leading-relaxed ${
                    message.role === "user" ? "text-white" : "text-zinc-700"
                  }`}
                >
                  {message.content}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
              <Sparkles className="w-4 h-4 text-pink-600" />
            </div>
            <Card className="bg-white border border-zinc-100 shadow-sm rounded-2xl" data-testid="typing-indicator">
              <CardContent className="p-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Suggestions - Show only when no user messages yet */}
        {messages.length === 1 && (
          <div className="pt-4">
            <p className="text-[12px] text-zinc-400 mb-3">Try asking about:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSuggestionClick("I'm feeling exhausted and tired all the time")}
                className="bg-white border border-zinc-200 rounded-full px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors"
                data-testid="suggestion-tired"
              >
                Feeling exhausted
              </button>
              <button
                onClick={() => handleSuggestionClick("I have back pain after delivery")}
                className="bg-white border border-zinc-200 rounded-full px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors"
                data-testid="suggestion-back"
              >
                Back pain
              </button>
              <button
                onClick={() => handleSuggestionClick("I'm having trouble breastfeeding")}
                className="bg-white border border-zinc-200 rounded-full px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors"
                data-testid="suggestion-breastfeeding"
              >
                Breastfeeding help
              </button>
              <button
                onClick={() => handleSuggestionClick("I'm feeling sad and anxious")}
                className="bg-white border border-zinc-200 rounded-full px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors"
                data-testid="suggestion-mood"
              >
                Mood changes
              </button>
              <button
                onClick={() => handleSuggestionClick("When can I start exercising again?")}
                className="bg-white border border-zinc-200 rounded-full px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-50 transition-colors"
                data-testid="suggestion-exercise"
              >
                Exercise after birth
              </button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-zinc-100 p-4 sticky bottom-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your recovery or how you're feeling..."
            className="flex-1 bg-zinc-100 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-pink-300"
            data-testid="input-message"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-pink-600 hover:bg-pink-700 rounded-xl px-4"
            disabled={!inputMessage.trim() || isTyping}
            data-testid="button-send"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-[11px] text-zinc-400 text-center mt-2">
          Responses are for general guidance only. Consult your doctor for medical advice.
        </p>
      </div>
    </div>
  );
}
