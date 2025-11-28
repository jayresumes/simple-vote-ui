import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { votingApi, type Candidate } from "@/lib/api";

const Vote = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const data = await votingApi.getCandidates();
        setCandidates(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load candidates",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [toast]);

  const steps = [
    { label: "Select", completed: !!selectedCandidate, current: !selectedCandidate },
    { label: "Confirm", completed: false, current: !!selectedCandidate },
    { label: "Complete", completed: false, current: false },
  ];

  const handleVoteSubmit = async () => {
    if (!selectedCandidate) return;
    
    setIsSubmitting(true);
    try {
      const receipt = await votingApi.submitVote(selectedCandidate);
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
              Presidential Election 2024
            </h1>
            <p className="mt-2 text-muted-foreground">
              Select your preferred candidate and submit your vote
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

            {candidates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No candidates available at this time.
              </p>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CandidateCard
                      id={candidate.id}
                      name={candidate.name}
                      party={candidate.party}
                      description={candidate.description}
                      isSelected={selectedCandidate === candidate.id}
                      onSelect={setSelectedCandidate}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Button
                variant="hero"
                size="xl"
                disabled={!selectedCandidate}
                onClick={() => setShowConfirmDialog(true)}
                className="min-w-[200px]"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Submit Vote
              </Button>
            </div>
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
                      {selectedCandidateData.party}
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
