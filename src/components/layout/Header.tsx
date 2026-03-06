import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Vote, LogIn, BarChart3, Home, Shield, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = saved === "dark" || (!saved && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/vote", label: "Vote", icon: Vote },
    { path: "/results", label: "Results", icon: BarChart3 },
  ];

  const adminNavItem = { path: "/admin", label: "Admin", icon: Shield };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Vote className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Palm eVote</span>
        </Link> */}
        <Link to="/" className="flex items-center gap-2">
  <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
    <img
      src="/logo.png"
      alt="Palm eVote Logo"
      className="h-full w-full object-contain"
    />
  </div>
  <span className="text-xl font-bold text-foreground">Palm eVote</span>
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
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <Button variant="outline" className="gap-2" onClick={logout}>
              <span className="hidden sm:inline">{user.email}</span>
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
