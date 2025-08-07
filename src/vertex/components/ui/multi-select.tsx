"use client"

import * as React from "react"
import { X, PlusCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Option {
  value: string
  label: string
}

interface MultiSelectComboboxProps {
  options: Option[]
  placeholder?: string
  value: string[]
  onValueChange: (values: string[]) => void
}

export function MultiSelectCombobox({
  options,
  placeholder = "Select tags...",
  value,
  onValueChange,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const selectedValues = new Set(value)

  const handleSelect = (itemValue: string) => {
    const newSet = new Set(value)
    if (newSet.has(itemValue)) {
      newSet.delete(itemValue)
    } else {
      newSet.add(itemValue)
    }
    onValueChange(Array.from(newSet).sort())
    setInputValue("")
  }

  const handleRemove = (itemValue: string) => {
    const newSet = new Set(value)
    newSet.delete(itemValue)
    onValueChange(Array.from(newSet).sort())
  }

  const handleCreateNew = () => {
    const normalized = inputValue.trim().toLowerCase()
    if (!normalized) return

    const newSet = new Set(value)
    newSet.add(normalized)
    onValueChange(Array.from(newSet).sort())
    setInputValue("")
    setOpen(false)
  }

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedValues.has(option.value)
  )

  const canCreateNew =
    inputValue.trim() !== "" &&
    !options.some(
      (option) =>
        option.label.toLowerCase() === inputValue.toLowerCase() ||
        option.value === inputValue.toLowerCase()
    ) &&
    !selectedValues.has(inputValue.toLowerCase())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[40px] flex-wrap bg-transparent"
        >
          <div className="flex flex-wrap gap-1">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              value.map((val) => {
                const option = options.find((o) => o.value === val)
                const label = option ? option.label : val
                return (
                  <Badge key={val} variant="secondary" className="flex items-center gap-1">
                    {label}
                    <button
                      type="button"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => handleRemove(val)}
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      <span className="sr-only">Remove {label}</span>
                    </button>
                  </Badge>
                )
              })
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or add new tag..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreateNew) {
                e.preventDefault()
                handleCreateNew()
              }
            }}
            className="h-9"
          />
          <CommandList>
            <ScrollArea className="h-48">
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </CommandItem>
                ))}
                {canCreateNew && (
                  <CommandItem
                    onSelect={handleCreateNew}
                    value={`create-new-${inputValue.toLowerCase()}`}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <span>Create &quot;{inputValue}&quot;</span>
                    <PlusCircle className="ml-2 h-4 w-4" />
                  </CommandItem>
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
