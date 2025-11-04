/**
 * Team member presence indicator
 */
"use client"

import { useState } from "react"
import { usePusher } from "@/hooks/use-pusher"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TeamMember {
  id: string
  name: string
  status: "online" | "offline"
}

export function PresenceIndicator() {
  const [members, setMembers] = useState<TeamMember[]>([])

  usePusher([
    {
      channel: "team-presence",
      event: "presence-update",
      callback: (data: any) => {
        setMembers((prev) => {
          const updated = [...prev]
          const memberIndex = updated.findIndex((m) => m.id === data.userId)

          if (memberIndex >= 0) {
            updated[memberIndex].status = data.status
          }

          return updated
        })
      },
    },
  ])

  return (
    <div className="flex items-center gap-2">
      {members.map((member) => (
        <div key={member.id} className="relative group">
          <Avatar className="w-8 h-8">
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
              member.status === "online" ? "bg-green-500" : "bg-muted"
            }`}
          />
          <div className="absolute bottom-12 left-0 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap">
            {member.name} - {member.status}
          </div>
        </div>
      ))}
    </div>
  )
}
