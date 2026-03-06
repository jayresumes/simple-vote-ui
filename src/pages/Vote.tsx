import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Loader2, ChevronRight, ChevronLeft, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import CandidateCard from "@/components/voting/CandidateCard";
import VotingProgress from "@/components/voting/VotingProgress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { votingApi, electionApi, categoryApi, type Candidate, type Election, type Category } from "@/lib/api";

const Vote = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Only show active elections
  const activeElections = useMemo(() => elections.filter((e) => e.status === "active"), [elections]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [candidatesData, electionsData, categoriesData] = await Promise.all([
          votingApi.getCandidates(),
          electionApi.getElections(),
          categoryApi.getCategories(),
        ]);
        setCandidates(candidatesData);
        setElections(electionsData);
        setCategories(categoriesData);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast, isAuthenticated]);

  const electionCategories = useMemo(
    () => categories.filter((c) => c.election === selectedElection),
    [categories, selectedElection]
  );

  const currentCategory = electionCategories[currentCategoryIndex];

  const currentCategoryCandidates = useMemo(
    () => (currentCategory ? candidates.filter((c) => c.category === currentCategory.id) : []),
    [candidates, currentCategory]
  );

  const allCategoriesSelected = electionCategories.length > 0 && electionCategories.every((cat) => selections[cat.id]);

  // Build progress steps
  const steps = useMemo(() => {
    if (!selectedElection) {
      return [
        { label: "Election", completed: false, current: true },
        { label: "Vote", completed: false, current: false },
        { label: "Confirm", completed: false, current: false },
      ];
    }
    const categorySteps = electionCategories.map((cat, i) => ({
      label: cat.name.length > 10 ? cat.name.substring(0, 10) + "…" : cat.name,
      completed: !!selections[cat.id],
      current: i === currentCategoryIndex && !allCategoriesSelected,
    }));
    return [
      { label: "Election", completed: true, current: false },
      ...categorySteps,
      { label: "Confirm", completed: false, current: allCategoriesSelected },
    ];
  }, [selectedElection, electionCategories, selections, currentCategoryIndex, allCategoriesSelected]);

  const handleSelectCandidate = (categoryId: number, candidateId: number) => {
    setSelections((prev) => ({ ...prev, [categoryId]: candidateId }));
  };

  const handleNextCategory = () => {
    if (currentCategoryIndex < electionCategories.length - 1) {
      setCurrentCategoryIndex((i) => i + 1);
    }
  };

  const handlePrevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((i) => i - 1);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedElection) return;
    setIsSubmitting(true);
    try {
      let lastReceipt;
      for (const cat of electionCategories) {
        const candidateId = selections[cat.id];
        if (candidateId) {
          lastReceipt = await votingApi.submitVote(selectedElection, cat.id, candidateId);
        }
      }
      setShowSummaryDialog(false);
      toast({
        title: "Vote Submitted Successfully!",
        description: "Thank you for participating in the election.",
      });
      navigate("/confirmation", { state: { receipt: lastReceipt } });
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: error instanceof Error ? error.message : "Failed to submit vote",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <p className="text-muted-foreground mb-6">You must be signed in to vote.</p>
            <Button variant="hero" onClick={() => navigate("/login")} className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign In to Vote
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              {selectedElection
                ? elections.find((e) => e.id === selectedElection)?.title || "Election"
                : "Election Voting System"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {selectedElection
                ? `Category ${currentCategoryIndex + 1} of ${electionCategories.length}`
                : "Select an election to begin voting"}
            </p>
          </div>

          <VotingProgress steps={steps} />

          <div className="mt-8 rounded-xl border border-border bg-card/50 p-4 md:p-6">
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-foreground">
                You can only vote once. Please review your selections carefully before submitting.
              </p>
            </div>

            {/* Election Selection */}
            {!selectedElection && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground mb-4">Select an Election</h2>
                {activeElections.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active elections at this time.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeElections.map((election, index) => (
                      <div
                        key={election.id}
                        className="animate-slide-up cursor-pointer rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => {
                          setSelectedElection(election.id);
                          setCurrentCategoryIndex(0);
                          setSelections({});
                        }}
                      >
                        <h3 className="font-semibold text-foreground mb-2">{election.title}</h3>
                        {election.description && (
                          <p className="text-sm text-muted-foreground mb-3">{election.description}</p>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {election.is_public ? "Public" : "Private"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sequential Category Voting */}
            {selectedElection && currentCategory && (!allCategoriesSelected || isReviewing) && (
              <div className="space-y-4 animate-fade-in" key={currentCategory.id}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{currentCategory.name}</h2>
                    {currentCategory.description && (
                      <p className="text-sm text-muted-foreground mt-1">{currentCategory.description}</p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {currentCategoryIndex + 1} / {electionCategories.length}
                  </Badge>
                </div>

                {currentCategoryCandidates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No candidates in this category.</p>
                ) : (
                  <div className="space-y-4">
                    {currentCategoryCandidates.map((candidate, index) => (
                      <div key={candidate.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                        <CandidateCard
                          id={candidate.id.toString()}
                          name={candidate.name}
                          party="Independent"
                          description={candidate.bio || candidate.manifesto || ""}
                          image={candidate.image}
                          isSelected={selections[currentCategory.id] === candidate.id}
                          onSelect={() => handleSelectCandidate(currentCategory.id, candidate.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between mt-6 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={currentCategoryIndex === 0 ? () => { setSelectedElection(null); setSelections({}); } : handlePrevCategory}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {currentCategoryIndex === 0 ? "Change Election" : "Previous"}
                  </Button>
                  {currentCategoryIndex < electionCategories.length - 1 ? (
                    <Button
                      onClick={handleNextCategory}
                      disabled={!selections[currentCategory.id]}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      disabled={!selections[currentCategory.id]}
                      onClick={() => setIsReviewing(false)}
                    >
                      Done Reviewing
                      <CheckCircle2 className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* All categories done — show review prompt */}
            {selectedElection && allCategoriesSelected && (
              <div className="text-center py-8 space-y-4 animate-fade-in">
                <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">All Categories Completed!</h2>
                <p className="text-muted-foreground">
                  You've made selections in all {electionCategories.length} categories. Review and submit your votes.
                </p>
                <div className="flex justify-center gap-3 pt-4">
                  <Button variant="outline" onClick={() => { setCurrentCategoryIndex(0); setIsReviewing(true); }}>
                    Review Categories
                  </Button>
                  <Button variant="hero" size="lg" onClick={() => setShowSummaryDialog(true)}>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Review & Submit
                  </Button>
                </div>
              </div>
            )}

            {/* No categories for election */}
            {selectedElection && electionCategories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No categories available for this election.</p>
                <Button variant="outline" className="mt-4" onClick={() => setSelectedElection(null)}>
                  Back to Elections
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Confirmation Dialog */}
      <AlertDialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <AlertDialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Votes</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Please review your selections before submitting:</p>
                <div className="space-y-3">
                  {electionCategories.map((cat) => {
                    const candidate = candidates.find((c) => c.id === selections[cat.id]);
                    return (
                      <div key={cat.id} className="rounded-lg border border-border bg-secondary p-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {cat.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {candidate?.image && (
                            <img src={candidate.image} alt="" className="h-8 w-8 rounded-full object-cover" />
                          )}
                          <p className="font-semibold text-foreground">{candidate?.name || "—"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-destructive font-medium text-sm">
                  This action cannot be undone. Are you sure you want to proceed?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVoteSubmit} disabled={isSubmitting} className="gradient-primary">
              {isSubmitting ? "Submitting..." : "Confirm All Votes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Vote;
