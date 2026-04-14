'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { AqLink01, AqX } from '@airqo/icons-react';
import Image from 'next/image';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--airqo-background-light)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border border-[var(--airqo-border)] bg-[var(--airqo-background)]">
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4">
                    <Image 
                      src="/AirQo logo.svg" 
                      alt="AirQo Logo" 
                      width={64} 
                      height={64} 
                      className="object-contain"
                    />
                  </div>
            <CardTitle className="text-3xl font-bold text-[var(--airqo-text-primary)] font-inter">
              AirQo Survey Generator
            </CardTitle>
            <p className="text-[var(--airqo-text-secondary)] mt-2 font-inter">
              Sign in to access the survey generator
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  size="lg"
                  required
                  disabled={isLoading}
                />
                
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  size="lg"
                  required
                  disabled={isLoading}
                />
              </div>

                    {error && (
                      <div className="p-4 bg-[var(--airqo-error-light)] border border-[var(--airqo-error)] rounded-lg">
                        <div className="flex items-center gap-2">
                          <AqX size={16} className="text-[var(--airqo-error)]" />
                          <p className="text-[var(--airqo-error)] text-sm font-medium font-inter">{error}</p>
                        </div>
                      </div>
                    )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[var(--airqo-text-secondary)] font-inter">
                    Don&apos;t have an AirQo account?{' '}
                      <a 
                        href="https://analytics.airqo.net/user/login" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[var(--airqo-primary)] hover:text-[var(--airqo-primary-dark)] font-medium transition-colors inline-flex items-center gap-1"
                      >
                        Create one here
                        <AqLink01 size={12} />
                      </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
