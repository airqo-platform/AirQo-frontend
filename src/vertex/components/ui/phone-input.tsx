import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface PhoneNumberInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    description?: string
}

const PhoneNumberInput = React.forwardRef<HTMLInputElement, PhoneNumberInputProps>(
    ({ className, label, error, description, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && <Label>{label}</Label>}
                <Input
                    type="tel"
                    className={cn(error && "border-red-500 focus-visible:ring-red-500", className)}
                    ref={ref}
                    {...props}
                />
                {description && !error && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
                {error && (
                    <p className="text-sm font-medium text-red-500">{error}</p>
                )}
            </div>
        )
    }
)
PhoneNumberInput.displayName = "PhoneNumberInput"

export { PhoneNumberInput }
