
'use client';
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, BookOpen, Hand, MessageCircle, LogIn, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { APP_NAME } from '@/lib/constants';

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="flex items-start gap-4">
    <div className="p-2 bg-primary/10 rounded-full">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div>
      <h3 className="font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default function DoctorBiographyPage() {
    const router = useRouter();

    const handleLoginRedirect = () => {
        router.push(ROUTES.LOGIN);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 w-full">
            <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <Image src="/icons/icon.png" alt="Logo" width={32} height={32} data-ai-hint="logo" />
                        <h1 className="text-xl font-bold font-headline text-primary">{APP_NAME}</h1>
                    </div>
                    <Button onClick={handleLoginRedirect}>
                        <LogIn className="mr-2 h-4 w-4" />
                        লগইন করুন
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="shadow-lg bg-card/90">
                            <CardHeader>
                                <CardTitle className="text-3xl font-headline text-center text-primary">ডাঃ নিহার রঞ্জন বিশ্বাস</CardTitle>
                                <p className="text-center text-muted-foreground">ডি.এইচ.এম.এস (বি.এইচ.বি), ঢাকা।</p>
                            </CardHeader>
                            <CardContent className="prose prose-lg dark:prose-invert max-w-none text-justify">
                                <p>
                                гомеопатический врач с более чем 20-летним опытом работы, известный своим глубоким знанием классической гомеопатии и преданностью служению пациентам. Он получил степень D.H.M.S (B.H.B) в одном из престижных гомеопатических медицинских колледжей Дакки и с тех пор посвятил свою жизнь лечению сложных и хронических заболеваний с использованием принципов, установленных доктором Самуэлем Ганеманом.
                                </p>
                                <p>
                                Его подход к лечению основан на целостном анализе пациента, включая не только физические симптомы, но и психическое и эмоциональное состояние, а также историю болезни и семейный анамнез. Он твердо верит, что для подбора правильного лекарства необходимо понимать всего человека, а не только его болезнь.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md bg-card/90">
                            <CardHeader>
                                <CardTitle className="text-xl font-headline">চিকিৎসা দর্শন</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FeatureCard 
                                    icon={Hand}
                                    title="রোগীর প্রতি স্বতন্ত্র মনোযোগ"
                                    description="প্রতিটি রোগীর জন্য পর্যাপ্ত সময় দেওয়া হয় এবং তাদের কথা মনোযোগ দিয়ে শোনা হয়, যা সঠিক ঔষধ নির্বাচনের জন্য অপরিহার্য।"
                                />
                                <FeatureCard 
                                    icon={BookOpen}
                                    title="শাস্ত্রীয় পদ্ধতির অনুসরণ"
                                    description="ডাঃ হ্যানিম্যানের নির্দেশিত اصول ও পদ্ধতির উপর ভিত্তি করে মায়াজমেটিক পদ্ধতিতে চিকিৎসা প্রদান করা হয়।"
                                />
                                <FeatureCard 
                                    icon={MessageCircle}
                                    title="রোগীর শিক্ষা"
                                    description="রোগীদের তাদের রোগ এবং আরোগ্যের প্রক্রিয়া সম্পর্কে স্বচ্ছ ধারণা দেওয়া হয়, যা তাদের আরোগ্যলাভে সক্রিয়ভাবে অংশগ্রহণ করতে উৎসাহিত করে।"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card className="shadow-lg bg-card/90 text-center">
                            <CardContent className="pt-6">
                                <Image 
                                    src="https://placehold.co/400x400.png"
                                    alt="ডাঃ নিহার রঞ্জন বিশ্বাস"
                                    width={200}
                                    height={200}
                                    className="rounded-full mx-auto mb-4 border-4 border-primary/20 shadow-lg"
                                    data-ai-hint="doctor portrait"
                                />
                                <h2 className="text-2xl font-bold font-headline">ডাঃ নিহার রঞ্জন বিশ্বাস</h2>
                                <p className="text-muted-foreground">ডি.এইচ.এম.এস (বি.এইচ.বি), ঢাকা।</p>
                                <p className="text-sm text-primary font-semibold mt-1">রেজি. নং: ২৩৮৬৬</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md bg-card/90">
                            <CardHeader>
                                <CardTitle className="text-xl font-headline">দক্ষতা ও অভিজ্ঞতা</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Award className="w-5 h-5 text-amber-600" />
                                    <p className="text-muted-foreground">২০ বছরের অধিক সময় ধরে সফলতার সাথে চিকিৎসা সেবা প্রদান।</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="w-5 h-5 text-blue-600" />
                                    <p className="text-muted-foreground">জটিল ও পুরাতন রোগের চিকিৎসায় বিশেষ পারদর্শিতা।</p>
                                </div>
                                 <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-green-600" />
                                    <p className="text-muted-foreground">মায়াজমেটিক চিকিৎসায় গভীর জ্ঞান ও অভিজ্ঞতা।</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

