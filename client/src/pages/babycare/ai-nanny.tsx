import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "wouter";
import { 
  ArrowLeft, 
  Send,
  Bot,
  User,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import type { BabyProfile } from "@shared/schema";

const STARTER_PROMPTS = [
  "When should my baby start solid foods?",
  "How much sleep does my baby need?",
  "Is my baby's growth on track?",
  "Tips for teething pain relief",
];

const AI_RESPONSES: Record<string, string> = {
  "solid foods": "Most babies are ready to start solid foods around 6 months of age. Look for signs like sitting up with support, showing interest in food, and losing the tongue-thrust reflex. Start with single-ingredient purees like rice cereal, mashed banana, or sweet potato.",
  "sleep": "Sleep needs vary by age: Newborns (0-3 months) need 14-17 hours, infants (4-11 months) need 12-15 hours, and toddlers (1-2 years) need 11-14 hours. Establishing a bedtime routine can help your baby sleep better.",
  "growth": "Every baby grows at their own pace! Regular check-ups with your pediatrician are the best way to track growth. Generally, babies double their birth weight by 5 months and triple it by 1 year. If you're concerned, I recommend discussing with your healthcare provider.",
  "teething": "Teething can be tough! Try these tips: Cold teething rings, gentle gum massage with a clean finger, teething toys, and if approved by your doctor, infant pain relievers. Drooling and fussiness are normal during teething.",
  "default": "That's a great question about baby care! While I can provide general guidance, every baby is unique. For specific medical concerns, please consult with your pediatrician. Is there anything else you'd like to know about caring for your little one?",
};

function getAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("solid") || lowerMessage.includes("food") || lowerMessage.includes("eat")) {
    return AI_RESPONSES["solid foods"];
  }
  if (lowerMessage.includes("sleep") || lowerMessage.includes("nap") || lowerMessage.includes("bedtime")) {
    return AI_RESPONSES["sleep"];
  }
  if (lowerMessage.includes("growth") || lowerMessage.includes("weight") || lowerMessage.includes("height") || lowerMessage.includes("track")) {
    return AI_RESPONSES["growth"];
  }
  if (lowerMessage.includes("teeth") || lowerMessage.includes("teething") || lowerMessage.includes("gum")) {
    return AI_RESPONSES["teething"];
  }
  
  return AI_RESPONSES["default"];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function BabyCareAiNanny() {
  const params = useParams();
  const babyId = params.babyId;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: profiles = [] } = useQuery<BabyProfile[]>({
    queryKey: ["/api/baby-profiles"],
  });

  const baby = profiles.find(p => p.id === babyId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getAIResponse(text),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!baby) {
    return (
      <div className="app-container min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500" data-testid="text-baby-not-found">Baby not found</p>
      </div>
    );
  }

  return (
    <div className="app-container bg-zinc-50 min-h-screen flex flex-col">
      {/* Dark Charcoal Header */}
      <div className="bg-[#1a1a1a] text-white px-4 pt-4 pb-5">
        <div className="flex items-center gap-3">
          <Link href={`/babycare/home/${babyId}`} data-testid="link-back">
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
            <h1 className="text-[18px] font-bold" data-testid="text-title">AI Nanny</h1>
            <p className="text-[12px] text-white/70">Your 24/7 baby care assistant</p>
          </div>
          <div className="w-10 h-10 border border-white/20 bg-white/10 rounded-full flex items-center justify-center" data-testid="icon-bot">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-violet-500" />
              </div>
              <h2 className="text-[18px] font-bold text-zinc-900 mb-2" data-testid="text-welcome-heading">Hi! I'm AI Nanny</h2>
              <p className="text-[14px] text-zinc-500 text-center max-w-[280px] mb-6" data-testid="text-welcome-description">
                Ask me anything about your baby's health, feeding, sleep, or development.
              </p>
              
              {/* Starter Prompts */}
              <div className="w-full space-y-2">
                <p className="text-[12px] text-zinc-400 text-center mb-2">Try asking:</p>
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="w-full p-3 text-left text-[13px] text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors"
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
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${message.id}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-violet-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-violet-600 text-white rounded-br-md"
                        : "bg-zinc-100 text-zinc-800 rounded-bl-md"
                    }`}
                  >
                    <p className="text-[14px] leading-relaxed">{message.content}</p>
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
                <div className="flex gap-3 justify-start" data-testid="typing-indicator">
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-4 py-4 border-t border-zinc-100 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2" data-testid="form-message">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI Nanny..."
              className="flex-1 h-12 rounded-2xl bg-zinc-50 border-zinc-200 text-[14px] px-4"
              data-testid="input-message"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-12 w-12 rounded-2xl bg-violet-600 hover:bg-violet-700"
              data-testid="button-send"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-[10px] text-zinc-400 text-center mt-2" data-testid="text-disclaimer">
            AI Nanny provides general guidance only. For medical advice, consult a healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}
