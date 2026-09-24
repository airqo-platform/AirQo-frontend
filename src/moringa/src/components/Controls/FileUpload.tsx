"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/ui/button"
import { Upload } from "lucide-react"
import Papa from "papaparse"
import { useToast } from "@/ui/use-toast"
import type { Location, FileUploadProps } from "@/lib/types"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
// const ACCEPTED_FILE_TYPE = 'text/csv';

const normalizeColumnName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")

const latitudeAliases = new Set(["lat", "latitude"])
const longitudeAliases = new Set(["lng", "lon", "longitude"])

export function FileUpload({ onUpload }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const parseCSV = (file: File) => {
    setIsLoading(true)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      worker: true, // Enables Web Worker for performance
      complete: ({ data, meta }) => {
        setIsLoading(false)

        try {
          const headers = meta.fields?.map(normalizeColumnName) || []
          if (!headers.length) throw new Error("CSV file has no headers.")

          const latHeader = headers.find((h) => latitudeAliases.has(h))
          const lngHeader = headers.find((h) => longitudeAliases.has(h))

          if (!latHeader && !lngHeader) {
            throw new Error("Missing both latitude and longitude columns.")
          } else if (!latHeader) {
            throw new Error("Missing latitude column.")
          } else if (!lngHeader) {
            throw new Error("Missing longitude column.")
          }

          const locations: Location[] = data
            .map((row) => ({
              lat: Number.parseFloat(row[latHeader] || ""),
              lng: Number.parseFloat(row[lngHeader] || ""),
            }))
            .filter(({ lat, lng }) => !isNaN(lat) && !isNaN(lng))

          if (!locations.length) throw new Error("No valid latitude/longitude pairs found.")

          onUpload(locations)
          toast({
            title: "Success",
            description: `Imported ${locations.length} locations.`,
          })
        } catch (error) {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to parse CSV.",
            variant: "destructive",
          })
        }
      },
      error: () => {
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Failed to read CSV file.",
          variant: "destructive",
        })
      },
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "File size exceeds 5MB limit.",
        variant: "destructive",
      })
      return
    }

    parseCSV(file)
  }

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
      <Button
        variant="outline"
        className="flex w-full items-center justify-center rounded-xl border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        aria-label="Upload CSV file"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isLoading ? "Uploading..." : "Upload CSV"}
      </Button>
    </div>
  )
}
