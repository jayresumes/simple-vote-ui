import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Loader2, CalendarDays } from "lucide-react";
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
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
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
  }, [toast]);

  const steps = [
    { label: "Election", completed: !!selectedElection, current: !selectedElection },
    { label: "Category", completed: !!selectedCategory, current: !!selectedElection && !selectedCategory },
    { label: "Candidate", completed: !!selectedCandidate, current: !!selectedCategory && !selectedCandidate },
    { label: "Confirm", completed: false, current: !!selectedCandidate },
    { label: "Complete", completed: false, current: false },
  ];

  const handleVoteSubmit = async () => {
    if (!selectedElection || !selectedCategory || !selectedCandidate) return;

    setIsSubmitting(true);
    try {
      const receipt = await votingApi.submitVote(selectedElection, selectedCategory, selectedCandidate);
      setShowConfirmDialog(false);
      toast({
        title: "Vote Submitted Successfully!",
        description: "Thank you for participating in the election.",
      });
      navigate("/confirmation", { state: { receipt } });
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

  const selectedCandidateData = candidates.find((c) => c.id === selectedCandidate);

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
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              {selectedElection
                ? elections.find(e => e.id === selectedElection)?.title || "Election"
                : "Election Voting System"
              }
            </h1>
            <p className="mt-2 text-muted-foreground">
              {selectedElection ? "Select your preferred category and candidate to submit your vote" : "Select an election to begin voting"}
            </p>
          </div>

          <VotingProgress steps={steps} />

          <div className="mt-8 rounded-xl border border-border bg-card/50 p-4 md:p-6">
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-foreground">
                You can only vote once. Please review your selection carefully before submitting.
              </p>
            </div>

            {/* Election Selection Step */}
            {!selectedElection && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground mb-4">Select an Election</h2>
                {elections.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No elections available at this time.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {elections.map((election, index) => (
                      <div
                        key={election.id}
                        className="animate-slide-up cursor-pointer rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => setSelectedElection(election.id)}
                      >
                        <h3 className="font-semibold text-foreground mb-2">{election.title}</h3>
                        {election.description && (
                          <p className="text-sm text-muted-foreground mb-3">{election.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {election.is_public ? "Public" : "Private"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Category Selection Step */}
            {selectedElection && !selectedCategory && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Select a Category</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedElection(null)}
                  >
                    Change Election
                  </Button>
                </div>
                {(() => {
                  const filteredCategories = categories.filter(
                    (category) => category.election === selectedElection
                  );
                  return filteredCategories.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No categories available for this election.
                    </p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredCategories.map((category, index) => (
                        <div
                          key={category.id}
                          className="animate-slide-up cursor-pointer rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all"
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Candidate Selection Step */}
            {selectedElection && selectedCategory && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Select Your Candidate</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Change Category
                  </Button>
                </div>
                {(() => {
                  console.log('Candidates:', candidates);
                  console.log('Selected Category:', selectedCategory);
                  const filteredCandidates = candidates.filter(
                    (candidate) => candidate.category === selectedCategory
                  );
                  console.log('Filtered Candidates:', filteredCandidates);
                  return filteredCandidates.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No candidates available for this category.
                      <br />
                      <small className="text-xs">
                        Debug: Selected category: {selectedCategory}, Total candidates: {candidates.length}
                      </small>
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {filteredCandidates.map((candidate, index) => (
                        <div
                          key={candidate.id}
                          className="animate-slide-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <CandidateCard
                            id={candidate.id.toString()}
                            name={candidate.name}
                            party="Independent"
                            description={candidate.bio || candidate.manifesto}
                            image={candidate.image}
                            isSelected={selectedCandidate === candidate.id}
                            onSelect={(id) => setSelectedCandidate(parseInt(id))}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {selectedCandidate && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="hero"
                      size="xl"
                      onClick={() => setShowConfirmDialog(true)}
                      className="min-w-[200px]"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Submit Vote
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>You are about to cast your vote for:</p>
                {selectedCandidateData && (
                  <div className="rounded-lg border border-border bg-secondary p-4">
                    <p className="font-semibold text-foreground">
                      {selectedCandidateData.name}
                    </p>
                    <p className="text-sm text-primary">
                      Independent
                    </p>
                  </div>
                )}
                <p className="text-destructive font-medium">
                  This action cannot be undone. Are you sure you want to proceed?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVoteSubmit}
              disabled={isSubmitting}
              className="gradient-primary"
            >
              {isSubmitting ? "Submitting..." : "Confirm Vote"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Vote;
