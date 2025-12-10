import { useState, useRef } from "react";
import {
  Share2,
  ChevronRight,
  Shield,
  Heart,
  Baby,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface VaccineCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  onViewSchedule: () => void;
  babyName: string;
  vaccineName: string;
  ageGroup: string;
  completedDate: string;
}

function ConfettiPiece({
  delay,
  left,
  color,
}: {
  delay: number;
  left: number;
  color: string;
}) {
  return (
    <div
      className="absolute w-2 h-3 rounded-sm opacity-80"
      style={{
        left: `${left}%`,
        top: "-10px",
        backgroundColor: color,
        animation: `confetti-fall 3s ease-in-out ${delay}s infinite`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );
}

function Confetti() {
  const colors = [
    "#7c3aed",
    "#a78bfa",
    "#f472b6",
    "#fbbf24",
    "#34d399",
    "#60a5fa",
  ];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          delay={piece.delay}
          left={piece.left}
          color={piece.color}
        />
      ))}
    </div>
  );
}

export default function VaccineCelebration({
  isOpen,
  onClose,
  onViewSchedule,
  babyName,
  vaccineName,
  ageGroup,
  completedDate,
}: VaccineCelebrationProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const formattedDate = format(new Date(completedDate), "d MMMM yyyy");

  const generateCertificateImage = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const width = 600;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#f5f3ff");
    gradient.addColorStop(1, "#ede9fe");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative border
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Inner decorative line
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 35, width - 70, height - 70);

    // Badge: Baby face circle (left)
    const badgeCenterX = width / 2;
    const badgeCenterY = 85;

    // Pink circle for baby face
    const babyGradient = ctx.createRadialGradient(
      badgeCenterX - 25,
      badgeCenterY - 5,
      0,
      badgeCenterX - 25,
      badgeCenterY,
      40,
    );
    babyGradient.addColorStop(0, "#f472b6");
    babyGradient.addColorStop(1, "#ec4899");
    ctx.fillStyle = babyGradient;
    ctx.beginPath();
    ctx.arc(badgeCenterX - 25, badgeCenterY, 40, 0, Math.PI * 2);
    ctx.fill();

    // White border on baby circle
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Baby face icon (simplified)
    ctx.fillStyle = "#ffffff";
    // Baby head
    ctx.beginPath();
    ctx.arc(badgeCenterX - 25, badgeCenterY - 5, 18, 0, Math.PI * 2);
    ctx.fill();
    // Baby body
    ctx.beginPath();
    ctx.ellipse(badgeCenterX - 25, badgeCenterY + 20, 12, 8, 0, Math.PI, 0);
    ctx.fill();

    // Purple circle for shield (right, overlapping)
    const shieldGradient = ctx.createRadialGradient(
      badgeCenterX + 25,
      badgeCenterY - 5,
      0,
      badgeCenterX + 25,
      badgeCenterY,
      40,
    );
    shieldGradient.addColorStop(0, "#8b5cf6");
    shieldGradient.addColorStop(1, "#7c3aed");
    ctx.fillStyle = shieldGradient;
    ctx.beginPath();
    ctx.arc(badgeCenterX + 25, badgeCenterY, 40, 0, Math.PI * 2);
    ctx.fill();

    // White border on shield circle
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Shield icon
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(badgeCenterX + 25, badgeCenterY - 20);
    ctx.lineTo(badgeCenterX + 45, badgeCenterY - 5);
    ctx.lineTo(badgeCenterX + 45, badgeCenterY + 10);
    ctx.quadraticCurveTo(
      badgeCenterX + 25,
      badgeCenterY + 30,
      badgeCenterX + 5,
      badgeCenterY + 10,
    );
    ctx.lineTo(badgeCenterX + 5, badgeCenterY - 5);
    ctx.closePath();
    ctx.fill();

    // Heart inside shield
    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.arc(badgeCenterX + 20, badgeCenterY, 6, 0, Math.PI * 2);
    ctx.arc(badgeCenterX + 30, badgeCenterY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(badgeCenterX + 14, badgeCenterY + 2);
    ctx.lineTo(badgeCenterX + 25, badgeCenterY + 15);
    ctx.lineTo(badgeCenterX + 36, badgeCenterY + 2);
    ctx.fill();

    // Sparkle decoration
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(badgeCenterX + 55, badgeCenterY - 30, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a16207";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("✦", badgeCenterX + 49, badgeCenterY - 24);

    // Title
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Protection Milestone", width / 2, 170);
    ctx.fillText("Unlocked!", width / 2, 205);

    // Sparkles decoration
    ctx.fillStyle = "#fbbf24";
    const sparklePositions = [
      { x: 100, y: 180 },
      { x: 500, y: 180 },
      { x: 80, y: 220 },
      { x: 520, y: 220 },
    ];
    sparklePositions.forEach((pos) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Baby name
    ctx.fillStyle = "#7c3aed";
    ctx.font = "bold 36px Inter, sans-serif";
    ctx.fillText(babyName, width / 2, 290);

    // Completion text
    ctx.fillStyle = "#52525b";
    ctx.font = "20px Inter, sans-serif";
    ctx.fillText("completed the", width / 2, 340);

    // Age group
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 32px Inter, sans-serif";
    ctx.fillText(`${ageGroup} vaccine visit`, width / 2, 390);

    // Vaccine name
    ctx.fillStyle = "#7c3aed";
    ctx.font = "18px Inter, sans-serif";
    ctx.fillText(`(${vaccineName})`, width / 2, 430);

    // Date badge
    ctx.fillStyle = "#7c3aed";
    roundRect(ctx, width / 2 - 100, 470, 200, 40, 20);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.fillText(formattedDate, width / 2, 496);

    // Praise line
    ctx.fillStyle = "#52525b";
    ctx.font = "italic 18px Inter, sans-serif";
    ctx.fillText("Great job keeping your", width / 2, 570);
    ctx.fillText("baby safe and healthy!", width / 2, 600);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText(
      "Protecting little ones, one vaccine at a time",
      width / 2,
      725,
    );

    // Small hearts decoration
    ctx.fillStyle = "#f472b6";
    [120, 480].forEach((x) => {
      ctx.beginPath();
      ctx.arc(x - 4, 700, 4, 0, Math.PI * 2);
      ctx.arc(x + 4, 700, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 8, 702);
      ctx.lineTo(x, 715);
      ctx.lineTo(x + 8, 702);
      ctx.fill();
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 1);
    });
  };

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const blob = await generateCertificateImage();
      if (!blob) {
        throw new Error("Failed to generate image");
      }

      const file = new File([blob], `${babyName}-vaccine-certificate.png`, {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${babyName}'s Vaccine Milestone`,
          text: `${babyName} completed the ${ageGroup} vaccine visit!`,
          files: [file],
        });
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${babyName}-vaccine-certificate.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
          title: "Certificate downloaded!",
          description: "Share it with family and friends.",
        });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast({
          title: "Sharing failed",
          description: "Please try downloading the certificate instead.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Confetti />

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />

      <DialogContent
        className="max-w-[360px] p-0 bg-transparent border-0 shadow-none overflow-visible [&>button]:text-zinc-700 [&>button]:hover:text-zinc-900 [&>button]:hover:bg-zinc-100 [&>button]:rounded-full [&>button]:h-10 [&>button]:w-10 [&>button]:top-4 [&>button]:right-4 [&>button]:opacity-100"
        data-testid="celebration-certificate"
      >
        {/* Certificate Card */}
        <Card className="relative w-full bg-gradient-to-b from-violet-50 to-purple-50 border-2 border-violet-200 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-400 via-purple-500 to-pink-400" />

          <CardContent className="p-6 pt-8 text-center">
            {/* Badge - Baby face + Shield/Heart */}
            <div className="relative mx-auto mb-5">
              <div className="flex items-center justify-center gap-1">
                {/* Baby face circle */}
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <Baby className="w-7 h-7 text-white" />
                </div>
                {/* Shield with heart */}
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white -ml-3">
                  <div className="relative">
                    <Shield className="w-7 h-7 text-white" />
                    <Heart className="w-3 h-3 text-pink-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
              <div className="absolute -top-1 right-16 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                <Sparkles className="w-4 h-4 text-yellow-700" />
              </div>
            </div>

            {/* Title */}
            <h2
              className="text-[22px] font-bold text-zinc-900 mb-2"
              data-testid="text-celebration-title"
            >
              Protection milestone unlocked!
            </h2>

            {/* Subtitle */}
            <p
              className="text-[15px] text-zinc-600 mb-4"
              data-testid="text-celebration-subtitle"
            >
              <span className="font-bold text-violet-600">{babyName}</span>{" "}
              completed the{" "}
              <span className="font-bold text-violet-600">{ageGroup}</span>{" "}
              vaccine visit
            </p>

            {/* Vaccine name badge */}
            <div
              className="inline-block bg-violet-100 text-violet-700 text-[13px] font-medium px-3 py-1 rounded-full mb-4"
              data-testid="text-vaccine-name"
            >
              {vaccineName}
            </div>

            {/* Date */}
            <div
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[14px] font-bold py-2 px-4 rounded-xl inline-block mb-5"
              data-testid="text-celebration-date"
            >
              {formattedDate}
            </div>

            {/* Praise */}
            <p
              className="text-[14px] text-zinc-500 italic mb-6"
              data-testid="text-praise"
            >
              Great job keeping your baby safe and healthy!
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl h-12 text-[15px] font-semibold shadow-lg gap-2"
                data-testid="button-share-certificate"
              >
                <Share2 className="w-4 h-4" />
                {isSharing ? "Preparing..." : "Share certificate"}
              </Button>

              <Button
                onClick={onViewSchedule}
                variant="outline"
                className="w-full border-2 border-violet-200 text-violet-600 hover:bg-violet-50 rounded-xl h-12 text-[15px] font-semibold gap-2"
                data-testid="button-view-schedule"
              >
                View next vaccines
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
