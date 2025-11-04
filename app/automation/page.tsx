/**
 * Automation & Scheduled Messages Page
 */
"use client"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Trash2, Edit2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AutomationPage() {
  const { data: scheduled = [], mutate } = useSWR("/api/scheduled-messages", fetcher)

  const handleCancel = async (messageId: string) => {
    try {
      const response = await fetch(`/api/scheduled-messages/${messageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        mutate()
        toast.success("Message cancelled")
      }
    } catch (error) {
      toast.error("Failed to cancel message")
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Message Automation</h1>
          <p className="text-muted-foreground">Schedule and automate your outreach campaigns</p>
        </div>

        {scheduled.length === 0 ? (
          <Card>
            <CardContent className="pt-8">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No scheduled messages</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {scheduled.map((msg: any) => (
              <Card key={msg.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{msg.channel}</Badge>
                        {msg.isRecurring && <Badge variant="outline">Recurring</Badge>}
                        <Badge variant={msg.status === "PENDING" ? "default" : "secondary"}>{msg.status}</Badge>
                      </div>
                      <p className="text-sm mb-2">{msg.content}</p>
                      <p className="text-xs text-muted-foreground">
                        Scheduled for{" "}
                        {formatDistanceToNow(new Date(msg.scheduledFor), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleCancel(msg.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
