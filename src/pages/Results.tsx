import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Users, Clock, RefreshCw, Loader2, CalendarDays, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import ResultBar from "@/components/results/ResultBar";
import {
  votingApi,
  electionApi,
  categoryApi,
  type VoteResult,
  type Election,
  type Category,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [results, setResults] = useState<VoteResult[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const selectedElection = elections.find((e) => e.id === selectedElectionId) || null;

  const fetchElections = async () => {
    try {
      const [electionsData, categoriesData] = await Promise.all([
        electionApi.getElections(),
        categoryApi.getCategories(),
      ]);
      setElections(electionsData);
      setCategories(categoriesData);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load elections",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchResults = async (electionId: number, showRefreshState = false) => {
    if (showRefreshState) {
      setIsRefreshing(true);
    }

    try {
      const voteResults = await votingApi.getResults(electionId);
      setResults(voteResults);
      setLastUpdatedAt(new Date().toISOString());
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load results",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    fetchElections();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedElectionId) {
      fetchResults(selectedElectionId);
    } else {
      setResults([]);
    }
  }, [selectedElectionId]);

  const handleRefresh = () => {
    if (selectedElectionId) {
      fetchResults(selectedElectionId, true);
    }
  };

  const handleElectionChange = (value: string) => {
    setSelectedElectionId(Number(value));
  };

  // Group results by category from the results data itself
  const categoryMap = new Map<number, { name: string; results: VoteResult[] }>();
  results.forEach((r) => {
    if (!categoryMap.has(r.category_id)) {
      categoryMap.set(r.category_id, { name: r.category_name, results: [] });
    }
    categoryMap.get(r.category_id)!.results.push(r);
  });

  const resultsByCategory = Array.from(categoryMap.entries()).map(([categoryId, { name, results: categoryResults }]) => {
    const categoryTotalVotes = categoryResults.reduce((sum, c) => sum + c.votes, 0);
    const sortedResults = [...categoryResults].sort((a, b) => b.votes - a.votes);
    const winner = sortedResults[0];
    return {
      categoryId,
      categoryName: name,
      results: sortedResults,
      totalVotes: categoryTotalVotes,
      winner,
    };
  });

  const totalVotes = results.reduce((sum, c) => sum + c.votes, 0);
  const formattedLastUpdated = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString()
    : "-";
  const formattedElectionDate = selectedElection?.start_date
    ? new Date(selectedElection.start_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="mx-auto max-w-md text-center rounded-xl border border-border bg-card p-8 shadow-soft">
            <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">You must be signed in to view results.</p>
            <Button variant="hero" onClick={() => navigate("/login")} className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                  Election Results
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Select an election to view results
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing || !selectedElectionId}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Election Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Select
                value={selectedElectionId?.toString() || ""}
                onValueChange={handleElectionChange}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select an election" />
                </SelectTrigger>
                <SelectContent>
                {elections.filter((e) => e.results_released).map((election) => (
                    <SelectItem key={election.id} value={election.id.toString()}>
                      {election.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedElection && formattedElectionDate && (
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {formattedElectionDate}
                </Badge>
              )}
            </div>
          </div>

          {/* Show message if no election selected */}
          {!selectedElectionId && (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Select an Election
              </h2>
              <p className="text-muted-foreground">
                Choose an election from the dropdown above to view its results.
              </p>
            </div>
          )}

          {/* Results by Category */}
          {selectedElectionId && (
            <>
              {/* Stats Cards */}
              <div className="mb-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4 shadow-soft animate-slide-up">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Votes</p>
                      <p className="font-semibold text-foreground">{totalVotes.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-soft animate-slide-up" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Categories</p>
                      <p className="font-semibold text-foreground">{resultsByCategory.length}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-soft animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-semibold text-foreground text-xs">{formattedLastUpdated}</p>
                    </div>
                  </div>
                </div>
              </div>

              {resultsByCategory.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">
                    No categories found for this election.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {resultsByCategory.map(({ categoryId, categoryName, results: categoryResults, totalVotes: categoryTotal, winner }) => (
                    <div key={categoryId} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          <h2 className="text-xl font-semibold text-foreground">
                            {categoryName}
                          </h2>
                        </div>
                        <Badge variant="secondary">
                          {categoryTotal.toLocaleString()} votes
                        </Badge>
                      </div>

                      {categoryResults.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No results available for this category.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {categoryResults.map((candidate, index) => (
                            <div
                              key={candidate.candidate_id}
                              className="animate-slide-up"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <ResultBar
                                name={candidate.candidate_name}
                                party={candidate.category_name}
                                votes={candidate.votes}
                                totalVotes={categoryTotal}
                                isWinner={candidate.candidate_id === winner?.candidate_id}
                                imageUrl={candidate.candidate_image}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 rounded-lg bg-primary/10 p-4 text-center text-sm text-muted-foreground">
                <p>
                  Results are updated in real-time as votes are counted and verified. 
                  Final results will be certified after the election closes.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Results;
