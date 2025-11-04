/**
 * Main Unified Inbox Page
 */
"use client"

import { useState, useEffect } from "react" // <-- Import useEffect
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { MessageCircle, Search, Plus, Settings } from "lucide-react"
import { ConversationList } from "@/components/inbox/conversation-list"
import { ChatWindow } from "@/components/inbox/chat-window"
import { ContactProfile } from "@/components/inbox/contact-profile"
import { useRouter } from "next/navigation" // <-- Import useRouter

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// NOT async anymore
export default function InboxPage() {
  const router = useRouter()

  // --- THIS IS THE NEW AUTH CHECK ---
  // 1. Fetch the session on the client side
  const { data: sessionData, error: sessionError } = useSWR("/api/auth/get-session", fetcher)

  // 2. Use useEffect to redirect if not logged in
  useEffect(() => {
    // If auth call is done and there is no session, redirect.
    if (sessionData && sessionData.session === null) {
      router.push("/auth/login")
    }
  }, [sessionData, router])
  // --- END OF AUTH CHECK ---

  // This is your original code
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showContactProfile, setShowContactProfile] = useState(false)

  // Fetch conversations
  const { data: conversationsData, isLoading } = useSWR("/api/conversations", fetcher, { revalidateOnFocus: false })

  // --- THIS IS THE FIX FOR .filter ---
  // Check if data is an array before passing it.
  const conversations = Array.isArray(conversationsData) ? conversationsData : []
  // --- END OF .filter FIX ---


  // Show a loading screen while checking auth
  if (!sessionData) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading session...
      </div>
    )
  }

  // Render the page
  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar - Conversations */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-6 h-6" />
            <h1 className="text-xl font-bold">Inbox</h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-md border border-input bg-background text-sm"
            />
          </div>

          <Button className="w-full gap-2">
            <Plus className="w-4 h-4" />
            New Message
          </Button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations} // Pass the safe, empty array
            selectedId={selectedContactId}
            onSelect={(id) => {
              setSelectedContactId(id)
              setShowContactProfile(false)
            }}
            searchQuery={searchQuery}
            isLoading={isLoading}
          />
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full gap-2 bg-transparent">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {selectedContactId ? (
          <>
            {/* Chat Window */}
            <ChatWindow
              contactId={selectedContactId}
              onShowProfile={() => setShowContactProfile(!showContactProfile)}
            />

            {/* Contact Profile Sidebar */}
            {showContactProfile && <ContactProfile contactId={selectedContactId} />}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a conversation to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}