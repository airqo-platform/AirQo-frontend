"use client"

import { useEffect, useRef } from "react"

interface UserDistributionChartProps {
  totalUsers: number
  activeUsers: number
  apiUsers: number
}

export function UserDistributionChart({ totalUsers, activeUsers, apiUsers }: UserDistributionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // // Calculate values
    // const inactiveUsers = totalUsers - activeUsers
    // const nonApiUsers = totalUsers - apiUsers

    // Define colors
    const colors = {
      primary: getComputedStyle(document.documentElement).getPropertyValue("--primary") || "#0ea5e9",
      secondary: "#64748b",
      tertiary: "#94a3b8",
      background: "#f1f5f9",
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw bar chart
    const barWidth = 60
    const spacing = 40
    const startX = (canvas.width - (barWidth * 3 + spacing * 2)) / 2
    const maxHeight = canvas.height - 60

    // Function to draw a bar
    const drawBar = (x: number, height: number, color: string, label: string, value: number) => {
      // Draw bar
      ctx.fillStyle = color
      ctx.fillRect(x, canvas.height - 40 - height, barWidth, height)

      // Draw label
      ctx.fillStyle = "#64748b"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(label, x + barWidth / 2, canvas.height - 20)

      // Draw value
      ctx.fillStyle = "#0f172a"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(value.toString(), x + barWidth / 2, canvas.height - 40 - height - 10)
    }

    // Calculate heights based on proportions
    const totalHeight = maxHeight
    const activeHeight = (activeUsers / totalUsers) * maxHeight
    const apiHeight = (apiUsers / totalUsers) * maxHeight

    // Draw bars
    drawBar(startX, totalHeight, colors.primary, "Total", totalUsers)
    drawBar(startX + barWidth + spacing, activeHeight, colors.secondary, "Active", activeUsers)
    drawBar(startX + (barWidth + spacing) * 2, apiHeight, colors.tertiary, "API", apiUsers)
  }, [totalUsers, activeUsers, apiUsers])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}
