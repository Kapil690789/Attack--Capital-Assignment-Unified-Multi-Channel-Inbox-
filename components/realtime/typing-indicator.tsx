/**
 * Typing indicator component
 */
"use client"

import { useState } from "react"
import { usePusher } from "@/hooks/use-pusher"

interface TypingUser {
  userId: string
  name: string
}

interface TypingIndicatorProps {
  contactId: string
}

export function TypingIndicator({ contactId }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])

  usePusher([
    {
      channel: `contact-${contactId}`,
      event: "user-typing",
      callback: (data: any) => {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return prev.some((u) => u.userId === data.userId)
              ? prev
              : [...prev, { userId: data.userId, name: data.userName }]
          } else {
            return prev.filter((u) => u.userId !== data.userId)
          }
        })
      },
    },
  ])

  if (typingUsers.length === 0) return null

  return (
    <div className="text-xs text-muted-foreground flex items-center gap-1">
      <span>{typingUsers.map((u) => u.name).join(", ")} typing</span>
      <div className="flex gap-1">
        <span className="inline-block w-1 h-1 bg-current rounded-full animate-pulse" />
        <span
          className="inline-block w-1 h-1 bg-current rounded-full animate-pulse"
          style={{ animationDelay: "0.1s" }}
        />
        <span
          className="inline-block w-1 h-1 bg-current rounded-full animate-pulse"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
    </div>
  )
}
