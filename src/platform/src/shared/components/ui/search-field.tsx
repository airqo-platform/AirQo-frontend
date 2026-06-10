import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { AqSearchRefraction, AqXClose } from '@airqo/icons-react';

export type SearchFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onClear?: () => void;
  showClearButton?: boolean;
};

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, onClear, showClearButton = true, ...props }, ref) => {
    const hasValue = props.value && String(props.value).length > 0;

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else {
        // If no onClear provided, try to clear the input
        const input = ref as React.RefObject<HTMLInputElement>;
        if (input?.current) {
          input.current.value = '';
          // Trigger change event
          const event = new Event('input', { bubbles: true });
          input.current.dispatchEvent(event);
        }
      }
    };

    return (
      <div className="relative min-w-0 w-full box-border">
        <input
          type="search"
          className={cn(
            'h-10 w-full min-w-0 max-w-full rounded-md border border-primary bg-background pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
        <AqSearchRefraction className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
        {showClearButton && hasValue && (
          <button
            onClick={handleClear}
            type="button"
            className="absolute transform -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <AqXClose className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);
SearchField.displayName = 'SearchField';

export { SearchField };
