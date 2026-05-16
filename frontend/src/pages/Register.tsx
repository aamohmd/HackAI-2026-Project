import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone, LockSimple, UserPlus, ChatCircleText } from "@phosphor-icons/react";

const registerSchema = z.object({
  phone_number: z.string().min(10, { message: "Invalid phone number" }),
  verification_code: z.string().length(4, { message: "Code must be 4 digits" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, sendOtp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const handleSendOtp = async () => {
    const phone = getValues('phone_number');
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number first.");
      return;
    }

    setIsSendingOtp(true);
    setError(null);
    try {
      await sendOtp(phone);
      setOtpSent(true);
    } catch (err: any) {
      setError("Failed to send WhatsApp code. Make sure you joined the Twilio Sandbox.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser(data.phone_number, data.password, data.verification_code);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register. Code might be wrong or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 font-sans">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-2 p-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <UserPlus size={32} weight="bold" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center tracking-tight">Register</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Get your WhatsApp code to start
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 p-6 pt-0">
            {error && (
              <div className="p-4 text-sm text-white bg-destructive rounded-md animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="phone_number" className="text-sm font-medium flex items-center gap-2 px-0.5">
                <Phone size={18} /> Phone Number
              </label>
              <div className="flex gap-2">
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="+212600000000"
                  {...register('phone_number')}
                  className={errors.phone_number ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? "..." : otpSent ? "Resend" : "Get Code"}
                </Button>
              </div>
              {errors.phone_number && (
                <p className="text-xs text-destructive mt-1 px-0.5">{errors.phone_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="verification_code" className="text-sm font-medium flex items-center gap-2 px-0.5">
                <ChatCircleText size={18} /> WhatsApp Code
              </label>
              <Input
                id="verification_code"
                placeholder="4-digit code"
                maxLength={4}
                {...register('verification_code')}
                disabled={!otpSent}
                className={errors.verification_code ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}
              />
              {errors.verification_code && (
                <p className="text-xs text-destructive mt-1 px-0.5">{errors.verification_code.message}</p>
              )}
              {otpSent && <p className="text-[10px] text-sky-600 font-medium animate-pulse">Check your WhatsApp!</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium flex items-center gap-2 px-0.5">
                <LockSimple size={18} /> Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1 px-0.5">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2 px-0.5">
                <LockSimple size={18} /> Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1 px-0.5">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-6 pt-0">
            <Button type="submit" className="w-full text-base font-semibold py-6" disabled={isLoading || !otpSent}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:text-primary/80 hover:underline transition-all">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
