/**
 * Dialog to compose new message
 */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import useSWR from "swr"

interface NewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectContact: (contactId: string) => void
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function NewMessageDialog({ open, onOpenChange, onSelectContact }: NewMessageDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "" })

  const { data: contacts = [] } = useSWR(open ? "/api/contacts" : null, fetcher)

  const filtered = contacts.filter(
    (c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phoneNumber?.includes(searchQuery),
  )

  const handleCreateContact = async () => {
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newContact.name,
          phoneNumber: newContact.phone,
          email: newContact.email,
          teamId: "default-team-id",
          userId: "user-id-from-session",
        }),
      })

      if (response.ok) {
        const contact = await response.json()
        onSelectContact(contact.id)
        onOpenChange(false)
        setNewContact({ name: "", phone: "", email: "" })
      }
    } catch (error) {
      console.error("Failed to create contact:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search existing contacts */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select or Create Contact</label>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {!isCreating && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">No contacts found</p>
                ) : (
                  filtered.map((contact: any) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        onSelectContact(contact.id)
                        onOpenChange(false)
                      }}
                      className="w-full text-left p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.phoneNumber || contact.email}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                {isCreating ? "Creating New" : "Or Create New"}
              </span>
            </div>
          </div>

          {/* Create new contact */}
          {isCreating && (
            <div className="space-y-3">
              <Input
                placeholder="Contact name"
                value={newContact.name}
                onChange={(e) => setNewContact((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Phone number"
                value={newContact.phone}
                onChange={(e) => setNewContact((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                placeholder="Email"
                value={newContact.email}
                onChange={(e) => setNewContact((prev) => ({ ...prev, email: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateContact} className="flex-1">
                  Create & Message
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setNewContact({ name: "", phone: "", email: "" })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isCreating && (
            <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsCreating(true)}>
              Create New Contact
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
