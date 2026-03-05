import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Shield } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { authApi, setAuthToken } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface GoogleJwtPayload {
  email?: string;
}

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkAuth } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const credential = credentialResponse.credential;
    if (!credential) {
      toast({ title: "Error", description: "No credential received from Google", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.googleLogin(credential);
      if (!response.user.is_staff) {
        toast({ title: "Access Denied", description: "Admin access required", variant: "destructive" });
        return;
      }
      setAuthToken(response.token);
      await checkAuth();
      toast({ title: "Success", description: "Admin login successful" });
      navigate("/admin");
    } catch (error) {
      toast({ title: "Login Failed", description: error instanceof Error ? error.message : "Authentication failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.adminLogin({ email, password });
      setAuthToken(response.token);
      await checkAuth();
      toast({ title: "Success", description: "Admin login successful" });
      navigate("/admin");
    } catch (error) {
      toast({ title: "Login Failed", description: error instanceof Error ? error.message : "Authentication failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-soft">
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground">Sign in with admin credentials</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="google" className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="google" className="flex-1">Google Login</TabsTrigger>
                <TabsTrigger value="email" className="flex-1">Email & Password</TabsTrigger>
              </TabsList>

              <TabsContent value="google">
                <div className="flex justify-center py-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      toast({ title: "Error", description: "Google sign-in failed", variant: "destructive" });
                    }}
                    theme="outline"
                    size="large"
                    width="350"
                    text="signin_with"
                  />
                </div>
              </TabsContent>

              <TabsContent value="email">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" variant="hero">
                    Sign In
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Not an admin?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Student Login
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
