import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Home, BarChart3, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { type VoteReceipt } from "@/lib/api";

const Confirmation = () => {
  const location = useLocation();
  const receipt = location.state?.receipt as VoteReceipt | undefined;

  const voteDetails = {
    confirmationNumber: receipt?.receipt_id || "N/A",
    candidateName: receipt?.candidate_name || "N/A",
    timestamp: receipt?.timestamp || new Date().toLocaleString(),
    election: "Presidential Election 2024",
  };

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/20 animate-scale-in">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
              <div className="absolute inset-0 animate-ping rounded-full bg-success/20" style={{ animationDuration: "2s" }} />
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Vote Submitted Successfully!
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Thank you for participating in the democratic process. Your vote has been securely recorded.
          </p>

          <div className="mb-8 rounded-xl border border-border bg-card p-6 text-left shadow-soft">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Vote Confirmation Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Confirmation Number</span>
                <span className="font-mono font-semibold text-primary">
                  {voteDetails.confirmationNumber}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Candidate</span>
                <span className="font-medium text-foreground">{voteDetails.candidateName}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Election</span>
                <span className="font-medium text-foreground">{voteDetails.election}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span className="text-foreground">{voteDetails.timestamp}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
            <Link to="/results">
              <Button variant="hero" size="lg" className="gap-2 w-full sm:w-auto">
                <BarChart3 className="h-4 w-4" />
                View Results
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          <div className="mt-12 rounded-lg bg-primary/10 p-4 text-sm text-muted-foreground">
            <p>
              Keep your confirmation number safe. You can use it to verify your vote was counted correctly.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Confirmation;
