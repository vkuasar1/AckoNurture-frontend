import { Link } from "wouter";
import { Heart } from "lucide-react";

interface MiraFabProps {
  babyId?: string;
}

export function MiraFab({ babyId }: MiraFabProps) {
  if (!babyId) return null;
  
  return (
    <Link href={`/babycare/mira/${babyId}`}>
      <button 
        className="absolute bottom-20 right-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity z-40"
        data-testid="button-mira-fab"
      >
        <Heart className="w-5 h-5" />
        <span className="text-[13px] font-semibold">Ask AaI</span>
      </button>
    </Link>
  );
}
