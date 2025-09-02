
'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { RemedyDetailsDialogContent } from '@/components/remedy-details-dialog-content';
import { Button } from '@/components/ui/button';
import { Pill, Info, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Remedy {
  name: string;
  description: string;
  score: number;
  justification: string;
  source: string;
}

interface RemedySuggestionsDisplayProps {
  remedies: Remedy[];
}

export function RemedySuggestionsDisplay({ remedies }: RemedySuggestionsDisplayProps) {
    const { toast } = useToast();

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text).then(() => {
        toast({
            title: `${type} কপি হয়েছে`,
            description: `"${text}" ক্লিপবোর্ডে কপি করা হয়েছে।`,
        });
        });
    };

  return (
    <Card className="shadow-lg border-border/20 bg-card/50 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Pill className="w-6 h-6 text-primary"/>
            সম্ভাব্য ঔষধের তালিকা
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {remedies.map((remedy, index) => (
          <Dialog key={index}>
            <Card className="bg-muted/30">
              <CardHeader className="p-3">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-md text-primary flex items-center gap-2">
                    <span>{remedy.name}</span>
                    <Badge variant="secondary">{remedy.source}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(remedy.name, 'ঔষধের নাম')}>
                        <Copy className="h-4 w-4" />
                     </Button>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Info className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </div>
                </div>
                <div className="w-full bg-muted-foreground/20 rounded-full h-2.5 mt-2">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${remedy.score}%` }}></div>
                </div>
                <p className="text-xs text-right mt-1 text-muted-foreground">Similarity Score: {remedy.score}%</p>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-sm text-foreground/80">{remedy.justification}</p>
              </CardContent>
            </Card>
            <RemedyDetailsDialogContent remedyName={remedy.name} />
          </Dialog>
        ))}
      </CardContent>
    </Card>
  );
}
