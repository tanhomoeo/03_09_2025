
import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, onInput, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);

    // This hook is used to manage the forwarded ref
    React.useImperativeHandle(ref, () => internalRef.current!, []);

    const handleAutoResize = (event: React.FormEvent<HTMLTextAreaElement>) => {
      if (internalRef.current) {
        internalRef.current.style.height = 'auto';
        internalRef.current.style.height = `${event.currentTarget.scrollHeight}px`;
      }
      // Forward the onInput event if it was provided
      if (onInput) {
        onInput(event);
      }
    };
    
    // Adjust height on initial render and when value changes programmatically
    React.useEffect(() => {
        if (internalRef.current) {
            internalRef.current.style.height = 'auto';
            internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
        }
    }, [props.value]);

    return (
      <textarea
        ref={internalRef}
        onInput={handleAutoResize}
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border-transparent bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-neumorphic-inset resize-none overflow-y-hidden',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
