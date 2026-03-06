import { cn } from "@/lib/utils";

interface ResultBarProps {
  name: string;
  party: string;
  votes: number;
  totalVotes: number;
  isWinner: boolean;
  imageUrl?: string;
}

const ResultBar = ({ name, party, votes, totalVotes, isWinner, imageUrl }: ResultBarProps) => {
  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className={cn(
                "h-12 w-12 rounded-full object-cover border-2",
                isWinner ? "border-success" : "border-border"
              )}
            />
          ) : (
            <div
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold",
                isWinner
                  ? "bg-success text-success-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {name.charAt(0)}
            </div>
          )}
          <div>
            <h4 className="font-semibold text-foreground">{name}</h4>
            <p className="text-sm text-muted-foreground">{party}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-foreground">
            {percentage.toFixed(1)}%
          </span>
          <p className="text-sm text-muted-foreground">{votes.toLocaleString()} votes</p>
        </div>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            isWinner ? "bg-success" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ResultBar;
