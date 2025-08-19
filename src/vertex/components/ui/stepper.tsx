import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Stepper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    index: number;
  }
>(({ index, className, children, ...props }, ref) => {
  const steps = React.Children.toArray(children);

  return (
    <div
      ref={ref}
      className={cn("flex items-center w-4/5", className)}
      {...props}
    >
      {steps.map((step, i) => {
        let title = null;
        let description = null;
        if (React.isValidElement(step)) {
          const children = React.Children.toArray(step.props.children);
          title = children[0] || null;
          description = children[1] || null;
        }
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className="w-full h-[2px] bg-muted-foreground/20">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: i <= index ? "100%" : "0%",
                  }}
                />
              </div>
            )}
            <div
              className={cn(
                "relative flex flex-col items-center",
                i <= index && "text-primary"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  i <= index ? "border-primary" : "border-muted-foreground/20",
                  i < index && "bg-primary text-primary-foreground"
                )}
              >
                {i < index ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </div>
              <div className="absolute top-10 w-max text-center">
                {title && (
                  <StepTitle
                    className={cn(
                      i <= index ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {title}
                  </StepTitle>
                )}
                {description && (
                  <StepDescription
                    className={cn(
                      i <= index
                        ? "text-muted-foreground"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {description}
                  </StepDescription>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
});
Stepper.displayName = "Stepper";

const Step = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Step.displayName = "Step";

const StepTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm font-medium", className)} {...props} />
));
StepTitle.displayName = "StepTitle";

const StepDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs", className)} {...props} />
));
StepDescription.displayName = "StepDescription";

export { Stepper, Step, StepTitle, StepDescription };
