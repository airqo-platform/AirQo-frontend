"use client"

import { useMemo, useState } from "react"
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns"
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3 } from "lucide-react"
import { Button } from "@/ui/button"
import { Checkbox } from "@/ui/checkbox"
import { Input } from "@/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover"
import type { ReportDateRange } from "@/lib/types"

interface NexusDateRangePickerProps {
  value: ReportDateRange
  onApply: (range: ReportDateRange) => void
  disabled?: boolean
}

type Preset = {
  label: string
  getRange: () => { start: Date; end: Date }
}

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MAX_REPORT_RANGE_MONTHS = 3

const dateFromIso = (value: string) => {
  const datePart = value.slice(0, 10)
  const timePart = value.slice(11, 16)
  const [year, month, day] = datePart.split("-").map(Number)
  const [hour = 0, minute = 0] = timePart.split(":").map(Number)
  return new Date(year, month - 1, day, hour, minute)
}

const toUtcIso = (date: Date) =>
  new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ),
  ).toISOString()

const setTime = (date: Date, value: string, fallbackEnd = false) => {
  const [hour, minute] = value.split(":").map(Number)
  const next = new Date(date)
  next.setHours(hour || 0, minute || 0, fallbackEnd ? 59 : 0, fallbackEnd ? 999 : 0)
  return next
}

export const createDefaultReportDateRange = (): ReportDateRange => {
  const today = new Date()
  return {
    startDate: toUtcIso(startOfDay(subDays(today, 6))),
    endDate: toUtcIso(endOfDay(today)),
  }
}

const presets: Preset[] = [
  { label: "Today", getRange: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }) },
  {
    label: "Yesterday",
    getRange: () => {
      const yesterday = subDays(new Date(), 1)
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
    },
  },
  {
    label: "Last 7 days",
    getRange: () => ({ start: startOfDay(subDays(new Date(), 6)), end: endOfDay(new Date()) }),
  },
  {
    label: "Last 30 days",
    getRange: () => ({ start: startOfDay(subDays(new Date(), 29)), end: endOfDay(new Date()) }),
  },
  {
    label: "Last 90 days",
    getRange: () => ({ start: startOfDay(subDays(new Date(), 89)), end: endOfDay(new Date()) }),
  },
  {
    label: "This month",
    getRange: () => ({ start: startOfMonth(new Date()), end: endOfDay(new Date()) }),
  },
]

function CalendarMonth({
  month,
  rangeStart,
  rangeEnd,
  maximumDate,
  onSelect,
}: {
  month: Date
  rangeStart: Date
  rangeEnd: Date | null
  maximumDate?: Date | null
  onSelect: (date: Date) => void
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-3 text-center text-sm font-semibold text-slate-800">{format(month, "MMMM yyyy")}</div>
      <div className="grid grid-cols-7 text-center">
        {weekDays.map((day) => (
          <span key={day} className="pb-2 text-[11px] font-semibold text-slate-500">{day}</span>
        ))}
        {days.map((day) => {
          const isStart = isSameDay(day, rangeStart)
          const isEnd = Boolean(rangeEnd && isSameDay(day, rangeEnd))
          const isInRange = Boolean(
            rangeEnd &&
              (isSameDay(day, rangeStart) || isSameDay(day, rangeEnd) || (isAfter(day, rangeStart) && isBefore(day, rangeEnd))),
          )
          const outside = !isSameMonth(day, month)
          const future = isAfter(startOfDay(day), startOfDay(new Date()))
          const beyondMaximum = Boolean(maximumDate && isAfter(startOfDay(day), startOfDay(maximumDate)))
          const unavailable = future || beyondMaximum

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={unavailable}
              onClick={() => onSelect(day)}
              className={`relative h-9 text-xs transition first:rounded-l-lg last:rounded-r-lg ${
                isInRange ? "bg-blue-50" : ""
              } ${outside ? "text-slate-300" : "text-slate-700"} ${unavailable ? "cursor-not-allowed opacity-35" : "hover:bg-blue-100"}`}
              aria-label={format(day, "MMMM d, yyyy")}
            >
              <span
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg ${
                  isStart || isEnd ? "bg-blue-600 font-bold text-white shadow-sm" : ""
                }`}
              >
                {format(day, "d")}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function NexusDateRangePicker({ value, onApply, disabled }: NexusDateRangePickerProps) {
  const initialStart = dateFromIso(value.startDate)
  const initialEnd = dateFromIso(value.endDate)
  const [open, setOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(initialStart)
  const [draftEnd, setDraftEnd] = useState<Date | null>(initialEnd)
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialStart))
  const [selectingEnd, setSelectingEnd] = useState(false)
  const [includeTime, setIncludeTime] = useState(
    initialStart.getHours() !== 0 || initialStart.getMinutes() !== 0 || initialEnd.getHours() !== 23 || initialEnd.getMinutes() !== 59,
  )
  const [startTime, setStartTime] = useState(format(initialStart, "HH:mm"))
  const [endTime, setEndTime] = useState(format(initialEnd, "HH:mm"))
  const maximumEndDate = useMemo(
    () => endOfDay(subDays(addMonths(startOfDay(draftStart), MAX_REPORT_RANGE_MONTHS), 1)),
    [draftStart],
  )

  const rangeError = useMemo(() => {
    if (!draftEnd) return "Choose an end date."
    if (isAfter(draftEnd, maximumEndDate)) {
      return `Reports support a maximum range of ${MAX_REPORT_RANGE_MONTHS} months.`
    }
    if (includeTime && isSameDay(draftStart, draftEnd) && startTime >= endTime) {
      return "Start time must be before end time."
    }
    return null
  }, [draftEnd, draftStart, maximumEndDate, includeTime, startTime, endTime])

  const syncFromValue = () => {
    const start = dateFromIso(value.startDate)
    const end = dateFromIso(value.endDate)
    setDraftStart(start)
    setDraftEnd(end)
    setVisibleMonth(startOfMonth(start))
    setSelectingEnd(false)
    setStartTime(format(start, "HH:mm"))
    setEndTime(format(end, "HH:mm"))
    setIncludeTime(
      start.getHours() !== 0 || start.getMinutes() !== 0 || end.getHours() !== 23 || end.getMinutes() !== 59,
    )
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) syncFromValue()
    setOpen(nextOpen)
  }

  const selectDate = (date: Date) => {
    if (!selectingEnd || draftEnd) {
      setDraftStart(startOfDay(date))
      setDraftEnd(null)
      setSelectingEnd(true)
      return
    }

    if (isBefore(date, draftStart)) {
      setDraftEnd(endOfDay(draftStart))
      setDraftStart(startOfDay(date))
    } else {
      setDraftEnd(endOfDay(date))
    }
    setSelectingEnd(false)
  }

  const applyPreset = (preset: Preset) => {
    const range = preset.getRange()
    setDraftStart(range.start)
    setDraftEnd(range.end)
    setVisibleMonth(startOfMonth(range.start))
    setSelectingEnd(false)
  }

  const handleApply = () => {
    if (!draftEnd || rangeError) return
    const start = includeTime ? setTime(draftStart, startTime) : startOfDay(draftStart)
    const end = includeTime ? setTime(draftEnd, endTime, true) : endOfDay(draftEnd)
    onApply({ startDate: toUtcIso(start), endDate: toUtcIso(end) })
    setOpen(false)
  }

  const triggerLabel = `${format(dateFromIso(value.startDate), "MMM d, yyyy")} - ${format(dateFromIso(value.endDate), "MMM d, yyyy")}`

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-3 shadow-[0_0_0_1px_rgba(37,99,235,0.04)]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Date range</label>
        <span className="rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-bold text-white">Custom</span>
      </div>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="min-h-12 h-auto w-full justify-start rounded-xl border-blue-200 bg-white px-3 py-2 text-left hover:bg-white"
          >
            <CalendarDays className="mr-2 h-4 w-4 shrink-0 text-blue-700" />
            <span className="truncate text-sm font-semibold text-slate-800">{triggerLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          collisionPadding={12}
          sticky="always"
          className="max-h-[calc(100vh-1.5rem)] w-[min(94vw,760px)] overflow-y-auto rounded-2xl border-slate-200 p-0 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row">
            <div className="grid shrink-0 grid-cols-2 gap-1 border-b border-slate-200 bg-slate-50 p-3 md:w-40 md:grid-cols-1 md:border-b-0 md:border-r">
              {presets.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-white hover:text-blue-700 hover:shadow-sm"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="min-w-0 flex-1 p-4">
              <div className="mb-2 flex items-center justify-between">
                <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setVisibleMonth(subMonths(visibleMonth, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-semibold text-blue-700">Select a start and end date</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
                  disabled={isSameMonth(visibleMonth, new Date()) || isAfter(visibleMonth, new Date())}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-6">
                <CalendarMonth month={visibleMonth} rangeStart={draftStart} rangeEnd={draftEnd} maximumDate={selectingEnd ? maximumEndDate : null} onSelect={selectDate} />
                <div className="hidden min-w-0 flex-1 md:block">
                  <CalendarMonth month={addMonths(visibleMonth, 1)} rangeStart={draftStart} rangeEnd={draftEnd} maximumDate={selectingEnd ? maximumEndDate : null} onSelect={selectDate} />
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white p-3 shadow-[0_-8px_20px_-16px_rgba(15,23,42,0.45)] sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                  {format(draftStart, "MMM d, yyyy")}
                </div>
                <span className="text-slate-400">to</span>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                  {draftEnd ? format(draftEnd, "MMM d, yyyy") : "Select end date"}
                </div>
                <label className="ml-1 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                  <Checkbox checked={includeTime} onCheckedChange={(checked) => setIncludeTime(checked === true)} />
                  <Clock3 className="h-3.5 w-3.5" /> Include time
                </label>
                {includeTime && (
                  <div className="flex items-center gap-1.5">
                    <Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="h-9 w-28" />
                    <span className="text-xs text-slate-400">-</span>
                    <Input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="h-9 w-28" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 lg:justify-end">
                <span className={`mr-auto text-xs ${rangeError ? "text-red-600" : "text-slate-500"}`}>
                  {rangeError || `${differenceInCalendarDays(draftEnd || draftStart, draftStart) + 1} day selection`}
                </span>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-lg">Cancel</Button>
                <Button type="button" onClick={handleApply} disabled={Boolean(rangeError)} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  <Check className="mr-1.5 h-4 w-4" /> Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <p className="mt-2 min-h-8 text-xs leading-4 text-slate-500">Choose up to {MAX_REPORT_RANGE_MONTHS} months, then select a city or district to generate the report.</p>
    </div>
  )
}
