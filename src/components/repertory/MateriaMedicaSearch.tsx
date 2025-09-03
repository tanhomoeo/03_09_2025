'use client';
import React, { useCallback, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, BookText, Loader2 } from 'lucide-react';
import { searchMateria, type MateriaEntry } from '@/lib/repertoryIndex';

export const MateriaMedicaSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MateriaEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const onSearch = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await searchMateria(q, 80);
      setResults(res);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length >= 2) {
      void onSearch(val);
    } else {
      setResults([]);
    }
  };

  return (
    <Card className="shadow-lg border-border/30 bg-card/60 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <BookText className="h-5 w-5 text-primary" /> মেটেরিয়া মেডিকা সার্চ
        </CardTitle>
        <CardDescription>
          প্রজেক্টের টেক্সট ফাইলগুলো থেকে কীওয়ার্ড দিয়ে অনুসন্ধান করুন এবং
          প্রাসঙ্গিক রেমেডি/টেক্সট দেখুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={handleChange}
            placeholder="কীওয়ার্ড লিখুন..."
            className="pl-10"
          />
        </div>
        <ScrollArea className="max-h-[420px]">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">অনুসন্ধান করা হচ্ছে...</span>
            </div>
          ) : results.length === 0 && query.trim() ? (
            <div className="text-center py-10 text-muted-foreground">
              কোনো ফলাফল পাওয়া যায়নি।
            </div>
          ) : (
            <ul className="space-y-3">
              {results.map((r, i) => (
                <li
                  key={`${r.source}-${r.index}-${i}`}
                  className="p-3 rounded-md border bg-card/70 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="text-sm text-muted-foreground truncate">
                      {r.source.split('/').pop()}
                    </div>
                    {r.remedy && (
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {r.remedy}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{r.snippet}</p>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
