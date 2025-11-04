/**
 * Conversation list component
 */
"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  contactName: string
  lastMessage: string
  channel: "SMS" | "WHATSAPP" | "EMAIL" | "TWITTER" | "FACEBOOK"
  lastMessageTime: string
  unreadCount: number
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  searchQuery: string
  isLoading: boolean
}

const channelColors: Record<string, string> = {
  SMS: "bg-blue-500",
  WHATSAPP: "bg-green-500",
  EMAIL: "bg-purple-500",
  TWITTER: "bg-sky-500",
  FACEBOOK: "bg-blue-600",
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  isLoading,
}: ConversationListProps) {
  const filtered = conversations.filter(
    (conv) =>
      conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-2 h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {filtered.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">No conversations found</div>
      ) : (
        filtered.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={`w-full p-4 hover:bg-accent text-left transition-colors ${
              selectedId === conversation.id ? "bg-accent" : ""
            }`}
          >
            <div className="flex gap-3">
              <Avatar>
                <AvatarFallback>{conversation.contactName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold truncate">{conversation.contactName}</h3>
                  <Badge variant="secondary" className={`h-5 ${channelColors[conversation.channel]}`}>
                    {conversation.channel}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.lastMessageTime), {
                      addSuffix: true,
                    })}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-red-500 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  )
}
