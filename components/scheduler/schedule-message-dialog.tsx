/**
 * Dialog to schedule messages
 */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface ScheduleMessageDialogProps {
  contactId: string
  channel: "SMS" | "WHATSAPP" | "EMAIL"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: () => void
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function ScheduleMessageDialog({
  contactId,
  channel,
  open,
  onOpenChange,
  onSchedule,
}: ScheduleMessageDialogProps) {
  const [content, setContent] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDays, setRecurringDays] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSchedule = async () => {
    if (!content.trim() || !scheduledTime) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/scheduled-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          channel,
          content,
          scheduledFor: new Date(scheduledTime).toISOString(),
          isRecurring,
          recurringDays: isRecurring ? recurringDays : null,
        }),
      })

      if (response.ok) {
        toast.success("Message scheduled")
        setContent("")
        setScheduledTime("")
        setIsRecurring(false)
        setRecurringDays([])
        onOpenChange(false)
        onSchedule()
      }
    } catch (error) {
      toast.error("Failed to schedule message")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDay = (dayIndex: number) => {
    setRecurringDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort(),
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Message</label>
            <Textarea
              placeholder="Enter message content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-24 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Schedule For</label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
              Recurring
            </label>
          </div>

          {isRecurring && (
            <div>
              <label className="text-sm font-medium mb-2 block">Repeat on</label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleDay(idx)}
                    className={`p-2 text-xs font-medium rounded transition-colors ${
                      recurringDays.includes(idx)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={isLoading} className="flex-1">
              {isLoading ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
