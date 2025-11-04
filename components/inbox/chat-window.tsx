/**
 * Enhanced with real-time collaboration features
 */
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Paperclip, Info, Clock, CheckCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import { usePusher } from "@/hooks/use-pusher"
import { TypingIndicator } from "@/components/realtime/typing-indicator"

interface Message {
  id: string
  content: string
  direction: "INBOUND" | "OUTBOUND"
  channel: string
  createdAt: string
  status: string
}

interface ChatWindowProps {
  contactId: string
  onShowProfile: () => void
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())
let typingTimeout: NodeJS.Timeout

export function ChatWindow({ contactId, onShowProfile }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const [channel, setChannel] = useState<"SMS" | "WHATSAPP" | "EMAIL">("SMS")
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduledTime, setScheduledTime] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    data: messages = [],
    mutate,
    isLoading,
  } = useSWR(`/api/messages/${contactId}`, fetcher, { revalidateOnFocus: false, refreshInterval: 3000 })

  const { data: contact } = useSWR(`/api/contacts/${contactId}`, fetcher, { revalidateOnFocus: false })

  // Real-time message updates
  usePusher([
    {
      channel: `contact-${contactId}`,
      event: "new-message",
      callback: () => {
        mutate()
      },
    },
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Broadcast typing status
    clearTimeout(typingTimeout)
    fetch("/api/realtime/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactId,
        isTyping: true,
      }),
    })

    typingTimeout = setTimeout(() => {
      fetch("/api/realtime/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          isTyping: false,
        }),
      })
    }, 2000)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          content: message,
          channel,
          scheduledFor: isScheduling ? new Date(scheduledTime).toISOString() : null,
        }),
      })

      if (response.ok) {
        setMessage("")
        setScheduledTime("")
        setIsScheduling(false)
        mutate()
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === "DELIVERED") return <CheckCheck className="w-3 h-3" />
    if (status === "READ") return <CheckCheck className="w-3 h-3 text-blue-500" />
    if (status === "FAILED") return <Clock className="w-3 h-3 text-red-500" />
    return <Clock className="w-3 h-3" />
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{contact?.name?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{contact?.name || "Unknown"}</h2>
            <div className="flex gap-2 text-xs text-muted-foreground">
              {contact?.phoneNumber && <span>{contact.phoneNumber}</span>}
              {contact?.email && <span>{contact.email}</span>}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onShowProfile}>
          <Info className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground">No messages yet</div>
        ) : (
          messages.map((msg: Message) => (
            <div key={msg.id} className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`max-w-xs p-3 ${
                  msg.direction === "OUTBOUND" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <span className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs px-1">
                      {msg.channel}
                    </Badge>
                    {getStatusIcon(msg.status)}
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <div className="px-4 py-2">
        <TypingIndicator contactId={contactId} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 space-y-3 bg-card">
        <div className="flex gap-2">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as "SMS" | "WHATSAPP" | "EMAIL")}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="EMAIL">Email</option>
          </select>

          <Button variant="outline" size="sm" onClick={() => setIsScheduling(!isScheduling)}>
            <Clock className="w-4 h-4 mr-1" />
            Schedule
          </Button>
        </div>

        {isScheduling && (
          <div>
            <label className="text-sm font-medium mb-1 block">Schedule for</label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={handleMessageChange}
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.ctrlKey) handleSendMessage()
            }}
            className="flex-1 min-h-12 resize-none"
            rows={2}
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Ctrl + Enter to send</p>
      </div>
    </div>
  )
}
