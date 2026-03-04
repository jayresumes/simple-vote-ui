import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { authApi, setAuthToken } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";

interface GoogleJwtPayload {
  email?: string;
  name?: string;
  picture?: string;
}

const OTPLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkAuth } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const credential = credentialResponse.credential;
    if (!credential) {
      toast({
        title: "Error",
        description: "No credential received from Google",
        variant: "destructive",
      });
      return;
    }

    // Decode the JWT to check email domain
    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credential);
      const email = decoded.email || "";

      if (!email.endsWith("@palm.edu.gh")) {
        toast({
          title: "Invalid Email",
          description: "Only @palm.edu.gh email addresses are allowed",
          variant: "destructive",
        });
        return;
      }
    } catch {
      // If decode fails, let the backend handle validation
    }

    setIsLoading(true);
    try {
      const response = await authApi.googleLogin(credential);
      setAuthToken(response.token);
      await checkAuth();

      toast({
        title: "Success",
        description: "You have been logged in successfully",
      });
      navigate("/vote");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to authenticate with Google",
        variant: "destructive",
      });
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
                <svg className="h-6 w-6 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
            <p className="text-muted-foreground">
              Use your <strong>@palm.edu.gh</strong> Google account to sign in
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast({
                    title: "Error",
                    description: "Google sign-in failed. Please try again.",
                    variant: "destructive",
                  });
                }}
                theme="outline"
                size="large"
                width="350"
                text="signin_with"
              />
            </div>
          )}

          <div className="rounded-lg bg-primary/10 p-3 text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> Only <strong>@palm.edu.gh</strong> email addresses are permitted.
              Contact your school administrator if you have issues signing in.
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Admin?{" "}
            <a href="/admin-login" className="text-primary hover:underline">
              Admin Login
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default OTPLogin;
