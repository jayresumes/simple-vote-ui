import { useState, useEffect } from "react";
import { BarChart3, Users, Clock, RefreshCw, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import ResultBar from "@/components/results/ResultBar";
import { votingApi, type VoteResult } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchResults = async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    
    try {
      const data = await votingApi.getResults();
      setResults(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleRefresh = () => {
    fetchResults(true);
  };

  const totalVotes = results.reduce((sum, candidate) => sum + candidate.votes, 0);
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes);
  const winner = sortedResults[0];

  const stats = [
    { label: "Total Votes", value: totalVotes.toLocaleString(), icon: Users },
    { label: "Leading", value: winner?.candidate_name || "-", icon: TrendingUp },
    { label: "Last Updated", value: "Just now", icon: Clock },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                Election Results
              </h1>
              <p className="mt-2 text-muted-foreground">
                Presidential Election 2024 - Live Results
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-4 shadow-soft animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="font-semibold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Results Chart */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Vote Distribution
              </h2>
            </div>

            {results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No results available yet.
              </p>
            ) : (
              <div className="space-y-4">
                {sortedResults.map((candidate, index) => (
                  <div
                    key={candidate.candidate_id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ResultBar
                      name={candidate.candidate_name}
                      party={candidate.party}
                      votes={candidate.votes}
                      totalVotes={totalVotes}
                      isWinner={candidate.candidate_id === winner?.candidate_id}
                    />
                  </div>
                ))}
              </div>
            )}

            {totalVotes > 0 && (
              <div className="mt-8 rounded-lg bg-secondary p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Votes Cast</span>
                  <span className="font-semibold text-foreground">
                    {totalVotes.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-lg bg-primary/10 p-4 text-center text-sm text-muted-foreground">
            <p>
              Results are updated in real-time as votes are counted and verified. 
              Final results will be certified after the election closes.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
