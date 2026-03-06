import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateCardProps {
  id: string;
  name: string;
  party: string;
  description: string;
  imageUrl?: string;
  image?: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const CandidateCard = ({
  id,
  name,
  party,
  description,
  imageUrl,
  image,
  isSelected,
  onSelect,
}: CandidateCardProps) => {
  const displayImage = image || imageUrl;
  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        "relative w-full rounded-xl border-2 bg-card p-6 text-left transition-all duration-300 hover:shadow-medium",
        isSelected
          ? "border-primary shadow-glow bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
    >
      {isSelected && (
        // <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary animate-scale-in">
        <div className="relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200">
          <Check className="h-5 w-5 text-primary-foreground" />
        </div>
       

      )}

      <div className="flex items-start gap-4">
        {/* <div className="h-9 w-18 overflow-hidden rounded-full bg-secondary flex-shrink-0"> */}
        <div className="h-32 w-32 overflow-hidden rounded-full bg-secondary flex-shrink-0">
          {displayImage ? (
            <img
              src={displayImage}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
              {name.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{name}</h3>
          <p className="text-sm font-medium text-primary">{party}</p>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default CandidateCard;
