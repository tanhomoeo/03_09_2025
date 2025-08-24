
"use client";

import { UseFormReturn, ControllerRenderProps } from "react-hook-form";
import { Loader2, Mic } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
 
const symptomFormSchema = z.object({ // eslint-disable-line @typescript-eslint/no-unused-vars
  symptoms: z.string().min(10, { message: "অনুগ্রহ করে লক্ষণগুলি কমপক্ষে ১০টি অক্ষরে বর্ণনা করুন।" }),
});

export type SymptomFormValues = z.infer<typeof symptomFormSchema>;

interface SymptomFormProps {
  form: UseFormReturn<SymptomFormValues>;
  onSubmit: (values: SymptomFormValues) => void;
  isLoading: boolean;
}

export function SymptomForm({ form, onSubmit, isLoading }: SymptomFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="symptoms"
          render={({ field }: { field: ControllerRenderProps<SymptomFormValues, "symptoms"> }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="এখানে রোগীর মানসিক, শারীরিক, এবং পূর্বের ইতিহাস সহ সকল লক্ষণ বিস্তারিতভাবে লিখুন..."
                  className="min-h-[200px] text-base bg-background border-border/80 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                <Mic className="h-3 w-3" />
                <span>টিপস: ভয়েস টাইপিংয়ের জন্য কীবোর্ডের 'Control' কী চাপুন।</span>
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-center pt-2">
          <Button
            type="submit"
            className="w-full text-base font-bold py-3 h-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                বিশ্লেষণ করা হচ্ছে...
              </>
            ) : (
              "বিশ্লেষণ করুন"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
