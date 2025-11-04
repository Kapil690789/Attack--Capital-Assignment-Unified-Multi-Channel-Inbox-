/**
 * Enhanced contact profile with better notes and history display
 */
"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, MessageSquare, FileText, Calendar, Lock } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface ContactProfileProps {
  contactId: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ContactProfile({ contactId }: ContactProfileProps) {
  const [noteContent, setNoteContent] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)

  const { data: contact } = useSWR(`/api/contacts/${contactId}`, fetcher, {
    revalidateOnFocus: false,
  })

  const { data: notes = [], mutate: mutateNotes } = useSWR(`/api/contacts/${contactId}/notes`, fetcher, {
    revalidateOnFocus: false,
  })

  const { data: history = [] } = useSWR(`/api/contacts/${contactId}/history`, fetcher, { revalidateOnFocus: false })

  const handleAddNote = async () => {
    if (!noteContent.trim()) return

    setIsAddingNote(true)
    try {
      const response = await fetch(`/api/contacts/${contactId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteContent,
          isPrivate,
        }),
      })

      if (response.ok) {
        setNoteContent("")
        setIsPrivate(false)
        mutateNotes()
        toast.success("Note added")
      }
    } catch (error) {
      toast.error("Failed to add note")
    } finally {
      setIsAddingNote(false)
    }
  }

  return (
    <div className="w-96 border-l border-border flex flex-col bg-card overflow-hidden">
      {/* Contact Info Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-lg mb-4">{contact?.name || "Contact"}</h3>

        <div className="space-y-2 text-sm">
          {contact?.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{contact.email}</span>
            </div>
          )}
          {contact?.phoneNumber && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{contact.phoneNumber}</span>
            </div>
          )}
          {contact?.whatsapp && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span>{contact.whatsapp}</span>
            </div>
          )}
          {contact?.lastMessageAt && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Calendar className="w-4 h-4" />
              <span>Last message {formatDistanceToNow(new Date(contact.lastMessageAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notes" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="notes" className="flex-1">
            Notes
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            History
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="flex-1 overflow-y-auto p-4 flex flex-col">
          {/* Add Note Form */}
          <div className="mb-4 space-y-2">
            <Textarea
              placeholder="Add a note..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="min-h-20 resize-none"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPrivate(!isPrivate)}
                className={isPrivate ? "bg-muted" : ""}
              >
                <Lock className="w-3 h-3 mr-1" />
                {isPrivate ? "Private" : "Public"}
              </Button>
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={isAddingNote || !noteContent.trim()}
                className="flex-1"
              >
                {isAddingNote ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-2">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet</p>
            ) : (
              notes.map((note: any) => (
                <Card key={note.id} className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs font-medium text-muted-foreground">{note.user?.name || "Unknown"}</p>
                    {note.isPrivate && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                  </p>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity</p>
            ) : (
              history.map((item: any) => (
                <div key={item.id} className="border-l-2 border-muted pl-3 py-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    {item.type === "message" && <MessageSquare className="w-3 h-3" />}
                    {item.type === "note" && <FileText className="w-3 h-3" />}
                    {item.action}
                  </p>
                  {item.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.content}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
