import { Link, useLocation } from "react-router-dom";
import { Vote, LogIn, BarChart3, Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/vote", label: "Vote", icon: Vote },
    { path: "/results", label: "Results", icon: BarChart3 },
  ];

  const adminNavItem = { path: "/admin", label: "Admin", icon: Shield };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Vote className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">eVote</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "gap-2",
                  location.pathname === item.path && "bg-secondary text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
          {isAdmin && (
            <Link to={adminNavItem.path}>
              <Button
                variant="ghost"
                className={cn(
                  "gap-2",
                  location.pathname === adminNavItem.path && "bg-secondary text-primary"
                )}
              >
                <adminNavItem.icon className="h-4 w-4" />
                {adminNavItem.label}
              </Button>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="outline" className="gap-2" onClick={logout}>
              <span className="hidden sm:inline">{user.name}</span>
              <span className="sm:hidden">Logout</span>
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
