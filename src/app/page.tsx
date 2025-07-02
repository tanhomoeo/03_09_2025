
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email({ message: "অনুগ্রহ করে একটি বৈধ ইমেল ঠিকানা লিখুন।" }),
  password: z.string().min(1, { message: "পাসওয়ার্ড আবশ্যক।" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);


export default function LoginPage() {
  const { user, loading, signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isEmailSigningIn, setIsEmailSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // Redirect if user is already logged in
    if (!loading && user) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [user, loading, router]);

  const handleEmailSignIn = async (data: LoginFormValues) => {
    setIsEmailSigningIn(true);
    try {
      await signInWithEmail(data.email, data.password);
       toast({
          title: "লগইন সফল হয়েছে",
          description: "ড্যাশবোর্ডে আপনাকে স্বাগতম!",
      });
      // useEffect will handle redirect
    } catch (error: any) {
       console.error("Email Sign-In Error:", error);
       let errorMessage = "ইমেল বা পাসওয়ার্ড ভুল হয়েছে।";
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            errorMessage = "আপনার দেওয়া ইমেল বা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।";
       } else if(error.code === 'auth/invalid-email') {
            errorMessage = "প্রদত্ত ইমেল ঠিকানাটি অবৈধ।";
       } else if(error.code === 'auth/firebase-app-check-token-is-invalid' || error.code?.includes('requests-to-this-api')) {
            errorMessage = "Firebase নিরাপত্তা সেটিংসে সমস্যা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।";
       }
       toast({
        title: "লগইন ব্যর্থ হয়েছে",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
        setIsEmailSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    try {
      await signInWithGoogle();
      toast({
          title: "লগইন সফল হয়েছে",
          description: "ড্যাশবোর্ডে আপনাকে স্বাগতম!",
      });
      // Redirect will be handled by useEffect
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      let errorMessage = "Google দিয়ে লগইন করার সময় একটি সমস্যা হয়েছে।";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'লগইন পপ-আপটি বন্ধ করে দেওয়া হয়েছে।';
      }
      toast({
        title: "Google লগইন ব্যর্থ হয়েছে",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleSigningIn(false);
    }
  };


  // While checking auth state or if user is already logged in, show a loader
  if (loading || user) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* Spinning border as the outer animation */}
            <div className="absolute h-[100px] w-[100px] rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            {/* Logo container */}
            <div className="p-4 bg-card rounded-full shadow-neumorphic-outset">
              <Image 
                  src="/icons/icon.png" 
                  alt={`${APP_NAME} Logo`}
                  width={64} 
                  height={64}
                  priority
                  data-ai-hint="clinic health logo"
              />
            </div>
          </div>
          <p className="text-muted-foreground mt-2">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Render the login page if not loading and no user is found
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center items-center">
           <div className="mx-auto mb-4">
            <div className="p-3 bg-card rounded-full shadow-neumorphic-outset inline-block">
              <Image 
                  src="/icons/icon.png" 
                  alt="Login Logo"
                  width={48} 
                  height={48}
                  priority
                  data-ai-hint="clinic health logo"
              />
            </div>
           </div>
          <CardTitle className="text-2xl font-headline text-foreground tracking-wide">
            লগইন ফরম
          </CardTitle>
           <CardDescription>
            আপনার অ্যাকাউন্টে প্রবেশ করতে আপনার তথ্য দিন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailSignIn)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="ইমেইল" {...field} type="email" />
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
                    <FormControl>
                      <Input placeholder="পাসওয়ার্ড" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isEmailSigningIn || isGoogleSigningIn} className="w-full font-bold tracking-wider !mt-6">
                {isEmailSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                লগইন
              </Button>
            </form>
          </Form>

           <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    অথবা এটি দিয়ে চালিয়ে যান
                    </span>
                </div>
            </div>

            <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isEmailSigningIn || isGoogleSigningIn}
                className="w-full"
            >
                {isGoogleSigningIn ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <GoogleIcon className="mr-2 h-5 w-5" />
                )}
                Google
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}
