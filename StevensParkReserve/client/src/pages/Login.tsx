import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const [_, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, setLocation]);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login(data.username, data.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  // For demo purposes, let's provide sample credentials
  const fillDemoCredentials = () => {
    form.setValue('username', 'demo_user');
    form.setValue('password', 'password123');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <img 
              src="https://web.stevens.edu/news/newspoints/brand-logos/2020/Stevens-Logos/Stevens-wordmark-2020.png" 
              alt="Stevens Logo" 
              className="h-12 mb-4" 
            />
          </div>
          <h1 className="text-3xl font-bold text-[#A32638] mb-1">ParkWise</h1>
          <p className="text-gray-600">Stevens Institute of Technology Parking System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Log in to your account</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-[#A32638]" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              Don't have an account? <a href="#" className="text-[#A32638] hover:underline">Sign up</a>
            </div>
            <div className="w-full pt-2 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full mt-2 border-dashed border-gray-300"
                onClick={fillDemoCredentials}
              >
                Use Demo Account
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>For demonstration purposes only.</p>
          <p className="mt-1">© {new Date().getFullYear()} Stevens Institute of Technology</p>
        </div>
      </div>
    </div>
  );
}