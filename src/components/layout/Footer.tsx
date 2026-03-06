import { Vote, Shield, Lock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Vote className="h-4 w-4 text-primary-foreground" />
            </div> */}
              <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
              <img
                src="/logo.png"
                alt="Palm eVote Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-foreground">Palm eVote</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span>Secure Voting</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" />
              <span>Privacy Protected</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2026 Palm eVote System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
