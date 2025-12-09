import { Link } from "wouter";
import { Heart } from "lucide-react";

interface MiraFabProps {
  babyId?: string;
}

export function MiraFab({ babyId }: MiraFabProps) {
  if (!babyId) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto px-4 flex justify-end">
        <Link href={`/babycare/mira/${babyId}`}>
          <button
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity pointer-events-auto"
            data-testid="button-mira-fab"
          >
            <Heart className="w-5 h-5" />
            <span className="text-[13px] font-semibold tracking-wide">
              Ask AI
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
}
