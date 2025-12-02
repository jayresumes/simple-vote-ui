import { Link } from "react-router-dom";
import { Vote, Shield, Users, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const Index = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your vote is encrypted and protected with industry-standard security measures.",
    },
    {
      icon: Users,
      title: "Easy to Use",
      description: "Simple and intuitive interface designed for voters of all technical backgrounds.",
    },
    {
      icon: Clock,
      title: "Real-time Results",
      description: "View live election results as votes are counted and verified.",
    },
  ];

  const activeElections = [
    {
      id: 1,
      title: "Presidential Election 2024",
      description: "Cast your vote for the next President",
      status: "Active",
      endDate: "Dec 15, 2024",
      candidates: 5,
    },
    {
      id: 2,
      title: "Local Council Election",
      description: "Choose your local representatives",
      status: "Active",
      endDate: "Dec 20, 2024",
      candidates: 8,
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Secure Electronic Voting
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Make Your Voice <span className="text-primary">Count</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Participate in secure, transparent, and accessible elections from anywhere. 
            Your vote matters, and we make it easy to exercise your democratic right.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/vote">
              <Button variant="hero" size="xl" className="gap-2">
                <Vote className="h-5 w-5" />
                Start Voting
              </Button>
            </Link>
            <Link to="/results">
              <Button variant="outline" size="lg" className="gap-2">
                View Results
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Why Choose Our Platform
          </h2>
          <p className="text-muted-foreground">
            Built with security and simplicity at its core
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-medium hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active Elections Section */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Active Elections
          </h2>
          <p className="text-muted-foreground">
            Participate in ongoing elections
          </p>
        </div>
        <div className="mx-auto max-w-3xl space-y-4">
          {activeElections.map((election) => (
            <div
              key={election.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-medium"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    {election.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Ends {election.endDate}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {election.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {election.description} • {election.candidates} candidates
                </p>
              </div>
              <Link to="/vote">
                <Button variant="default" className="gap-2">
                  Vote Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
