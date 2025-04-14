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

    // Set canvas dimensions with higher pixel density for sharper rendering
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains("dark")

    // Define attractive colors with gradients - adjusted for dark mode support
    const colors = {
      total: {
        start: "#6366f1", // Indigo
        end: "#4f46e5", // Darker indigo
      },
      active: {
        start: "#ec4899", // Pink
        end: "#db2777", // Darker pink
      },
      api: {
        start: "#06b6d4", // Cyan
        end: "#0891b2", // Darker cyan
      },
    }

    // Background and text colors based on theme
    const bgColor = isDarkMode ? "#1e293b" : "#f1f5f9"
    const textColor = isDarkMode ? "#e2e8f0" : "#0f172a"
    const mutedTextColor = isDarkMode ? "#94a3b8" : "#64748b"
    const gridLineColor = isDarkMode ? "#334155" : "#e2e8f0"

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    const barWidth = 80
    const spacing = 60
    const startX = (rect.width - (barWidth * 3 + spacing * 2)) / 2
    const maxHeight = rect.height - 120 // Increased bottom padding for labels
    const cornerRadius = 8

    // const topMargin = 50

    // Function to draw a rounded rectangle
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
    }

    // Function to draw a bar with gradient and animation
    const drawBar = (
      x: number,
      height: number,
      colorStart: string,
      colorEnd: string,
      label: string,
      value: number,
      percentage: number,
    ) => {
      const y = rect.height - 80 - height // Adjusted for more bottom space

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + height)
      gradient.addColorStop(0, colorStart)
      gradient.addColorStop(1, colorEnd)

      // Draw bar background (subtle shadow)
      ctx.fillStyle = bgColor
      drawRoundedRect(x - 2, y - 2, barWidth + 4, height + 4, cornerRadius)
      ctx.fill()

      // Draw bar with gradient
      ctx.fillStyle = gradient
      drawRoundedRect(x, y, barWidth, height, cornerRadius)
      ctx.fill()

      // Add subtle reflection effect
      const reflectionGradient = ctx.createLinearGradient(x, y, x + barWidth, y)
      reflectionGradient.addColorStop(0, "rgba(255, 255, 255, 0.1)")
      reflectionGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)")
      reflectionGradient.addColorStop(1, "rgba(255, 255, 255, 0.1)")

      ctx.fillStyle = reflectionGradient
      drawRoundedRect(x, y, barWidth, height * 0.2, cornerRadius)
      ctx.fill()

      // Draw label
      ctx.fillStyle = mutedTextColor
      ctx.font = "600 14px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(label, x + barWidth / 2, rect.height - 40) // Adjusted position

      // Draw value
      ctx.fillStyle = textColor
      ctx.font = "bold 16px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(value.toString(), x + barWidth / 2, y - 16)

      // Draw percentage
      ctx.fillStyle = mutedTextColor
      ctx.font = "500 12px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${percentage}%`, x + barWidth / 2, y - 2)
    }

    // Draw horizontal grid lines
    const gridLines = 5
    ctx.strokeStyle = gridLineColor
    ctx.lineWidth = 1

    // Calculate a nice round number for the max scale value
    // This ensures the scale is appropriate for the data
    const maxScaleValue = Math.ceil(totalUsers / 100) * 100

    for (let i = 0; i <= gridLines; i++) {
      const y = rect.height - 80 - (maxHeight / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(startX - 20, y)
      ctx.lineTo(startX + barWidth * 3 + spacing * 2 + 20, y)
      ctx.stroke()

      // Add grid labels with better scaling
      const gridValue = Math.round((maxScaleValue / gridLines) * i)
      ctx.fillStyle = mutedTextColor
      ctx.font = "12px Inter, system-ui, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(gridValue.toString(), startX - 25, y + 4)
    }

    // Calculate heights based on proportions and the adjusted scale
    const scaleFactor = maxHeight / maxScaleValue
    const totalHeight = totalUsers * scaleFactor
    const activeHeight = activeUsers * scaleFactor
    const apiHeight = apiUsers * scaleFactor

    // Calculate percentages
    const activePercentage = Math.round((activeUsers / totalUsers) * 100)
    const apiPercentage = Math.round((apiUsers / totalUsers) * 100)

    // Draw title
    ctx.fillStyle = textColor
    ctx.font = "bold 16px Inter, system-ui, sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("User Distribution", startX, 30)

    // Draw bars
    drawBar(startX, totalHeight, colors.total.start, colors.total.end, "Total Users", totalUsers, 100)

    drawBar(
      startX + barWidth + spacing,
      activeHeight,
      colors.active.start,
      colors.active.end,
      "Active Users",
      activeUsers,
      activePercentage,
    )

    drawBar(
      startX + (barWidth + spacing) * 2,
      apiHeight,
      colors.api.start,
      colors.api.end,
      "API Users",
      apiUsers,
      apiPercentage,
    )

    // Add legend at the top of the chart, centered
    const legendY = 25
    const legendWidth = 300 // Approximate width of the legend
    const legendX = (rect.width - legendWidth) / 2 // Center the legend

    const drawLegendItem = (x: number, color: string, label: string) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.rect(x, legendY - 8, 12, 12)
      ctx.fill()

      ctx.fillStyle = mutedTextColor
      ctx.font = "13px Inter, system-ui, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(label, x + 18, legendY)
    }

    // Space legend items evenly
    const legendSpacing = legendWidth / 3
    drawLegendItem(legendX, colors.total.start, "Total")
    drawLegendItem(legendX + legendSpacing, colors.active.start, "Active")
    drawLegendItem(legendX + legendSpacing * 2, colors.api.start, "API")
  }, [totalUsers, activeUsers, apiUsers])

  return (
    <div className="w-full h-[350px]">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}
