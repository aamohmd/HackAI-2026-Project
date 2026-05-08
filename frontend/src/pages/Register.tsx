import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EnvelopeSimple, LockSimple, UserPlus } from "@phosphor-icons/react";

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register. Email might already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4 font-sans">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-2 p-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <UserPlus size={32} weight="bold" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center tracking-tight">Register</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Create an account to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 p-6 pt-0">
            {error && (
              <div className="p-4 text-sm text-white bg-destructive rounded-md animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center gap-2 px-0.5">
                <EnvelopeSimple size={18} /> Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                {...register('email')}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1.5 px-0.5">{errors.email.message}</p>
              )}
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
                <p className="text-xs text-destructive mt-1.5 px-0.5">{errors.password.message}</p>
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
                <p className="text-xs text-destructive mt-1.5 px-0.5">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-6 pt-0">
            <Button type="submit" className="w-full text-base font-semibold py-6" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline transition-all">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
