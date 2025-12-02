import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { authApi, setAuthToken } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const OTPLogin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkAuth } = useAuth();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid school email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.sendOTP({ email });
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code",
      });
      setStep('otp');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length < 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyOTP({ email, otp });
      setAuthToken(response.token);
      await checkAuth();
      
      toast({
        title: "Success",
        description: "You have been logged in successfully",
      });
      navigate("/vote");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify OTP",
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
                {step === 'email' ? (
                  <Mail className="h-6 w-6 text-primary-foreground" />
                ) : (
                  <ShieldCheck className="h-6 w-6 text-primary-foreground" />
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {step === 'email' ? 'Verify Your Email' : 'Enter Verification Code'}
            </h1>
            <p className="text-muted-foreground">
              {step === 'email'
                ? 'Enter your school email to receive a verification code'
                : 'We sent a verification code to your email'}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">School Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                variant="hero"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  variant="hero"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('email')}
                  disabled={isLoading}
                >
                  Change Email
                </Button>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => handleSendOTP({ preventDefault: () => {} } as any)}
                  disabled={isLoading}
                  className="text-sm"
                >
                  Resend Code
                </Button>
              </div>
            </form>
          )}

          <div className="rounded-lg bg-primary/10 p-3 text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> Make sure to use your registered school email address.
              The verification code will expire in 10 minutes.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OTPLogin;
