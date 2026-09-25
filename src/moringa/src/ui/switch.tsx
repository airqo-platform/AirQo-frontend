"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-[3px] border-black bg-slate-200 px-0.5 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-emerald-100 data-[state=unchecked]:bg-slate-300",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 translate-x-[var(--switch-thumb-x)] rounded-full bg-black shadow-none ring-0 transition-transform duration-200 ease-out will-change-transform data-[state=checked]:[--switch-thumb-x:0rem] data-[state=checked]:animate-switch-thumb-bounce data-[state=unchecked]:[--switch-thumb-x:1.5rem] data-[state=unchecked]:animate-switch-thumb-bounce",
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

