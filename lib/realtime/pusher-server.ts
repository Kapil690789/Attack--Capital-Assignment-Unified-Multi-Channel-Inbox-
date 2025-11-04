/**
 * Updated imports to use pusher-server instead of pusher
 */
import { pusher } from "@/lib/pusher-server"

export async function notifyNewMessage(contactId: string, message: any) {
  await pusher.trigger(`contact-${contactId}`, "new-message", message)
}

export async function notifyPresence(userId: string, status: "online" | "offline") {
  await pusher.trigger("team-presence", `user-${userId}`, { status })
}

export async function notifyNoteUpdate(contactId: string, note: any) {
  await pusher.trigger(`contact-${contactId}`, "note-update", note)
}

export async function broadcastTypingStatus(contactId: string, userId: string, isTyping: boolean) {
  await pusher.trigger(`contact-${contactId}`, "user-typing", {
    userId,
    isTyping,
  })
}
