"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts"

interface MiniChartProps {
  title: string
  data: any[]
  dataKey: string
  type?: "bar" | "line" | "area"
  color?: string
}

export function MiniChart({ title, data, dataKey, type = "bar", color = "#3b82f6" }: MiniChartProps) {
  return (
    <Card className="border-border/50 hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={80}>
          {type === "bar" && (
            <BarChart data={data}>
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
          {type === "line" && (
            <LineChart data={data}>
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          )}
          {type === "area" && (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#gradient-${dataKey})`} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
