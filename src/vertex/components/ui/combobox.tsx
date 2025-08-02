"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboBoxOption {
  value: string
  label: string
  disabled?: boolean
}

interface ComboBoxProps {
  options: ComboBoxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  allowCustomInput?: boolean
  onCustomAction?: () => void
  customActionLabel?: string
}

export function ComboBox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  disabled = false,
  className,
  allowCustomInput = true,
  onCustomAction,
  customActionLabel,
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || "")

  // Update input value when external value changes
  React.useEffect(() => {
    setInputValue(value || "")
  }, [value])

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "__custom_action__" && onCustomAction) {
      onCustomAction()
      setOpen(false)
      return
    }

    setInputValue(selectedValue)
    onValueChange?.(selectedValue)
    setOpen(false)
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    if (allowCustomInput) {
      onValueChange?.(newValue)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && allowCustomInput) {
      onValueChange?.(inputValue)
      setOpen(false)
    }
  }

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  const selectedOption = options.find(option => option.value === value)
  const displayValue = selectedOption ? selectedOption.label : inputValue

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {displayValue || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {allowCustomInput ? (
                <div className="py-2 text-center text-sm">
                  <div className="text-muted-foreground">{emptyMessage}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Press Enter to use "{inputValue}"
                  </div>
                </div>
              ) : (
                emptyMessage
              )}
            </CommandEmpty>
            {filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                    disabled={option.disabled}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {customActionLabel && onCustomAction && (
              <CommandGroup>
                <CommandItem
                  value="__custom_action__"
                  onSelect={handleSelect}
                  className="text-primary font-semibold border-t mt-1 pt-2"
                >
                  {customActionLabel}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
