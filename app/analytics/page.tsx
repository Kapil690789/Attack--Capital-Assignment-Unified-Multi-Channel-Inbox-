/**
 * Analytics Dashboard Page
 */
"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { MessageSquare, Phone, TrendingUp } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AnalyticsPage() {
  const { data: analytics } = useSWR("/api/analytics", fetcher)

  const chartData = [
    { name: "SMS", sent: 45, received: 32, failed: 2 },
    { name: "WhatsApp", sent: 52, received: 48, failed: 1 },
    { name: "Email", sent: 28, received: 35, failed: 3 },
  ]

  const pieData = [
    { name: "SMS", value: analytics?.messagesSent || 0 },
    { name: "WhatsApp", value: 52 },
    { name: "Email", value: 28 },
  ]

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Messages Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-2xl font-bold">{analytics?.messagesSent || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Messages Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-2xl font-bold">{analytics?.messagesReceived || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contacts Reached</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-purple-500" />
                <span className="text-2xl font-bold">{analytics?.contactsReached || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                <span className="text-2xl font-bold">78%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Messages by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#3b82f6" />
                  <Bar dataKey="received" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Channel Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
