"use client"

import React from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts"

interface MaintenanceBarChartProps {
    data: any[]
    xKey: string
    yKey: string
    color: string
    title: string
    height?: number
    yCurrent?: boolean
    unit?: string
    getColor?: (value: number) => string
    onBarClick?: (data: any) => void
}

export default function MaintenanceBarChart({
    data,
    xKey,
    yKey,
    color,
    title,
    height = 300,
    unit = "%",
    getColor,
    onBarClick
}: MaintenanceBarChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm h-full" style={{ minHeight: height }}>
                <h3 className="text-lg font-medium text-gray-700 mb-4">{title}</h3>
                <p className="text-gray-500">No data available</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            <div style={{ width: "100%", height }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey={xKey}
                            tick={{ fontSize: 12 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const value = Number(payload[0].value);
                                    const valueColor = getColor ? getColor(value) : (payload[0].color || color);
                                    return (
                                        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
                                            <p className="font-semibold text-gray-700 text-sm mb-1">{label}</p>
                                            <p className="text-sm font-medium" style={{ color: valueColor }}>
                                                {`${value.toFixed(1)}${unit}`}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getColor ? getColor(entry[yKey]) : color}
                                    onClick={() => onBarClick && onBarClick(entry)}
                                    style={{ cursor: onBarClick ? 'pointer' : 'default' }}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
